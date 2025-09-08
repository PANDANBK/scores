// Script de comptage des scores pour le jeu CABO
// Référence : À la fin de chaque manche, chaque joueur additionne la valeur de ses cartes
// afin d'obtenir un total de points【477810672813347†L69-L85】. Lorsque l'un des
// joueurs dépasse 100 points (ou atteint 100 points pour la seconde fois), la partie se
// termine et le joueur ayant le moins de points l'emporte【477810672813347†L88-L93】.
// Il existe une règle particulière : si un joueur atteint exactement 100 points, il
// redescend immédiatement à 50 points. Cette « deuxième chance » n'est appliquée
// qu'une seule fois par joueur【477810672813347†L88-L100】.

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');
    const addRoundBtn = document.getElementById('add-round-btn');
    // Bouton de rejouer : let pour pouvoir être réassigné après clonage
    let replayButton = document.getElementById('replay-btn');

    // Tableau pour suivre si chaque joueur a utilisé sa seconde chance
    let usedSecondChance = [];
    // Tableau pour stocker l'ajustement de score appliqué après la seconde chance (-50 par joueur concerné)
    let secondChanceAdjustment = [];

    // Génère dynamiquement les champs de nom en fonction du nombre de joueurs
    function updatePlayerNameFields() {
        playerNamesContainer.innerHTML = '';
        const count = parseInt(playerCountInput.value, 10);
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.classList.add('player-name-field');
            const label = document.createElement('label');
            label.textContent = `Joueur ${i + 1} :`;
            label.htmlFor = `player-${i}`;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `player-${i}`;
            input.name = `player-${i}`;
            input.placeholder = `Nom du joueur ${i + 1}`;
            div.appendChild(label);
            div.appendChild(input);
            playerNamesContainer.appendChild(div);
        }
    }

    // Initialiser les champs de nom par défaut
    updatePlayerNameFields();
    playerCountInput.addEventListener('change', updatePlayerNameFields);

    // Gérer la soumission du formulaire de configuration
    setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playerCount = parseInt(playerCountInput.value, 10);
        const playerNames = [];
        for (let i = 0; i < playerCount; i++) {
            const input = document.getElementById(`player-${i}`);
            const name = input.value.trim() || `Joueur ${i + 1}`;
            playerNames.push(name);
        }
        // Initialiser les variables de seconde chance
        usedSecondChance = new Array(playerCount).fill(false);
        secondChanceAdjustment = new Array(playerCount).fill(0);
        // Masquer la section de préparation, afficher la feuille de score
        document.getElementById('setup-section').classList.add('hidden');
        scoreSection.classList.remove('hidden');
        // Générer le tableau des scores
        generateScoreboard(playerNames);
        // Afficher le bouton de rejouer et configurer son évènement
        replayButton.classList.remove('hidden');
        const newButton = replayButton.cloneNode(true);
        replayButton.parentNode.replaceChild(newButton, replayButton);
        replayButton = newButton;
        replayButton.addEventListener('click', () => {
            const confirmed = window.confirm('Confirmez‑vous vouloir rejouer ? Les scores seront effacés.');
            if (confirmed) {
                // Réinitialiser les variables de seconde chance
                usedSecondChance = new Array(playerNames.length).fill(false);
                secondChanceAdjustment = new Array(playerNames.length).fill(0);
                generateScoreboard(playerNames);
            }
        });
    });

    // Génère la structure du tableau des scores
    function generateScoreboard(players) {
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En‑tête : colonne de manche, colonnes par joueur et une colonne pour le total de la manche
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const roundHeader = document.createElement('th');
        roundHeader.textContent = 'Manche';
        headerRow.appendChild(roundHeader);
        players.forEach((player) => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Corps : les manches seront ajoutées dynamiquement
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        // Pied : affiche le total cumulatif pour chaque joueur
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        const totalLabelCell = document.createElement('th');
        totalLabelCell.textContent = 'Total';
        totalRow.appendChild(totalLabelCell);
        players.forEach((player, index) => {
            const td = document.createElement('td');
            td.classList.add('total-cell');
            td.dataset.playerIndex = index;
            td.textContent = '0';
            totalRow.appendChild(td);
        });
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);
        scoreboardContainer.innerHTML = '';
        scoreboardContainer.appendChild(table);
        // Ajouter automatiquement une première manche
        addRound();
        // Mettre à jour l'indicateur de complétion
        updateCompletionTicks();
        // Mettre à jour les coches au niveau des cellules
        updateCellTicks();
    }

    // Ajoute une ligne pour une nouvelle manche
    function addRound() {
        const table = scoreboardContainer.querySelector('table');
        const tbody = table.querySelector('tbody');
        // Nombre de joueurs = nombre d'en‑têtes dans le thead moins la colonne de manche et total manche
        // Le nombre de joueurs est égal au nombre de cellules d'en‑tête moins une (la colonne "Manche")
        const playersCount = table.querySelectorAll('thead th').length - 1;
        const rowIndex = tbody.querySelectorAll('tr').length + 1;
        const tr = document.createElement('tr');
        const roundLabel = document.createElement('th');
        roundLabel.textContent = `Manche ${rowIndex}`;
        tr.appendChild(roundLabel);
        // Créer une cellule d'entrée par joueur
        for (let i = 0; i < playersCount; i++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            // Laisser les cellules de score vides par défaut pour CABO
            input.value = '';
            input.dataset.playerIndex = i;
            input.addEventListener('input', calculateTotals);
            td.appendChild(input);
            tr.appendChild(td);
        }
        // Pas de colonne "Total de la manche" pour CABO
        tbody.appendChild(tr);
        // Recalculer les totaux après avoir ajouté la manche
        calculateTotals();
        // Mettre à jour l'indicateur de complétion
        updateCompletionTicks();
        // Mettre à jour les coches au niveau des cellules
        updateCellTicks();
    }

    // Calcule les totaux pour chaque joueur ainsi que les totaux de manche
    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const tbodyRows = table.querySelectorAll('tbody tr');
        // Le nombre de joueurs est égal au nombre de cellules d'en‑tête moins une (colonne "Manche")
        const playersCount = table.querySelectorAll('thead th').length - 1;
        const playerTotals = new Array(playersCount).fill(0);
        // Parcourir chaque manche
        tbodyRows.forEach((row) => {
            let sumForRound = 0;
            const inputs = row.querySelectorAll('input');
            inputs.forEach((input) => {
                const value = parseInt(input.value, 10) || 0;
                const index = parseInt(input.dataset.playerIndex, 10);
                playerTotals[index] += value;
                sumForRound += value;
            });
            // Mettre à jour le total pour la manche en cours
            const roundTotalCell = row.querySelector('.round-total-cell');
            if (roundTotalCell) {
                roundTotalCell.textContent = sumForRound.toString();
            }
        });
        // Appliquer la règle de seconde chance
        // Si un joueur atteint exactement 100 points et n'a pas encore utilisé sa seconde chance,
        // on lui applique un ajustement de -50 points pour le reste de la partie【477810672813347†L88-L100】.
        for (let i = 0; i < playerTotals.length; i++) {
            if (playerTotals[i] === 100 && !usedSecondChance[i]) {
                usedSecondChance[i] = true;
                secondChanceAdjustment[i] = -50;
            }
            // Appliquer l'ajustement si le joueur a déjà utilisé sa seconde chance
            if (usedSecondChance[i]) {
                playerTotals[i] += secondChanceAdjustment[i];
            }
        }
        // Mettre à jour les cellules de totaux et ajouter une classe si le joueur dépasse 100
        const totalCells = table.querySelectorAll('.total-cell');
        totalCells.forEach((cell) => {
            const index = parseInt(cell.dataset.playerIndex, 10);
            const total = playerTotals[index];
            cell.textContent = total.toString();
            // Appliquer une classe CSS pour signaler un dépassement de 100 points
            if (total > 100) {
                cell.classList.add('exceeded');
            } else {
                cell.classList.remove('exceeded');
            }
        });
        // Mettre à jour l'indicateur de complétion après recalcul des totaux
        updateCompletionTicks();
        // Mettre à jour les coches au niveau des cellules
        updateCellTicks();
    }

    /**
     * Parcourt chaque joueur et vérifie si toutes les entrées de toutes les
     * manches sont remplies (même avec 0). Si c'est le cas, ajoute la classe
     * « completed » à l'en‑tête du joueur afin d'afficher une coche verte.
     */
    function updateCompletionTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const headers = table.querySelectorAll('thead th');
        const playerCount = headers.length - 1;
        const filled = new Array(playerCount).fill(true);
        // Pour chaque entrée, si la valeur est vide, marquer le joueur comme incomplet
        const inputs = table.querySelectorAll('tbody input');
        inputs.forEach((input) => {
            const pIndex = parseInt(input.dataset.playerIndex, 10);
            if (input.value === '' || input.value === undefined) {
                filled[pIndex] = false;
            }
        });
        for (let i = 0; i < playerCount; i++) {
            const th = headers[i + 1];
            if (filled[i]) {
                th.classList.add('completed');
            } else {
                th.classList.remove('completed');
            }
        }
    }

    /**
     * Met à jour les coches de chaque cellule de score. Si la valeur de l'entrée
     * est non vide, la classe « filled » est ajoutée à la cellule <td> afin
     * d'afficher une coche verte via CSS.
     */
    function updateCellTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const cells = table.querySelectorAll('tbody td');
        cells.forEach((td) => {
            const input = td.querySelector('input');
            if (!input) return;
            if (input.value !== '' && input.value !== undefined) {
                td.classList.add('filled');
            } else {
                td.classList.remove('filled');
            }
        });
    }

    // Écouter le clic du bouton d'ajout de manche
    addRoundBtn.addEventListener('click', () => {
        addRound();
    });
});