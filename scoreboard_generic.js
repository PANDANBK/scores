// Script générique pour compter les scores d'un jeu sans règles spécifiques.

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');
    const addRoundBtn = document.getElementById('add-round-btn');
    // Bouton de rejouer : let pour pouvoir le réassigner après clonage
    let replayButton = document.getElementById('replay-btn');

    // Met à jour les champs de noms de joueurs selon le nombre choisi
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

    updatePlayerNameFields();
    playerCountInput.addEventListener('change', updatePlayerNameFields);

    // Lorsqu'on valide la configuration, on génère la feuille de score
    setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playerCount = parseInt(playerCountInput.value, 10);
        const playerNames = [];
        for (let i = 0; i < playerCount; i++) {
            const input = document.getElementById(`player-${i}`);
            const name = input.value.trim() || `Joueur ${i + 1}`;
            playerNames.push(name);
        }
        document.getElementById('setup-section').classList.add('hidden');
        scoreSection.classList.remove('hidden');
        generateScoreboard(playerNames);
        // Afficher le bouton rejouer et configurer son évènement
        replayButton.classList.remove('hidden');
        const newButton = replayButton.cloneNode(true);
        replayButton.parentNode.replaceChild(newButton, replayButton);
        replayButton = newButton;
        replayButton.addEventListener('click', () => {
            const confirmed = window.confirm('Confirmez‑vous vouloir rejouer ? Les scores seront effacés.');
            if (confirmed) {
                generateScoreboard(playerNames);
            }
        });
    });

    // Génère le tableau des scores pour le jeu générique
    function generateScoreboard(players) {
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En‑tête : première cellule "Manche" + une par joueur + total manche
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
        const totalHeader = document.createElement('th');
        totalHeader.textContent = 'Total manche';
        headerRow.appendChild(totalHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Corps : aucune manche au départ, elle sera ajoutée dynamiquement
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        // Pied : totaux par joueur
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        const totalLabelCell = document.createElement('th');
        totalLabelCell.textContent = 'Total';
        totalRow.appendChild(totalLabelCell);
        players.forEach((player, pIndex) => {
            const td = document.createElement('td');
            td.classList.add('total-cell');
            td.dataset.playerIndex = pIndex;
            td.textContent = '0';
            totalRow.appendChild(td);
        });
        // Cellule vide pour aligner avec total manche
        const blankTd = document.createElement('td');
        blankTd.textContent = '';
        totalRow.appendChild(blankTd);
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);
        scoreboardContainer.innerHTML = '';
        scoreboardContainer.appendChild(table);
        // Ajoute la première manche automatiquement
        addRound();
        updateCompletionTicks();
        updateCellTicks();
    }

    // Ajoute une nouvelle manche (ligne) au tableau
    function addRound() {
        const table = scoreboardContainer.querySelector('table');
        const tbody = table.querySelector('tbody');
        if (!table || !tbody) return;
        const playerCount = table.querySelectorAll('thead th').length - 2; // -2 pour "Manche" et "Total manche"
        const rowIndex = tbody.querySelectorAll('tr').length + 1;
        const tr = document.createElement('tr');
        const roundLabel = document.createElement('th');
        roundLabel.textContent = `Manche ${rowIndex}`;
        tr.appendChild(roundLabel);
        // Créer une cellule d'entrée par joueur
        for (let i = 0; i < playerCount; i++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '';
            input.dataset.playerIndex = i;
            input.addEventListener('input', calculateTotals);
            td.appendChild(input);
            tr.appendChild(td);
        }
        // Cellule total de la manche
        const roundTotalCell = document.createElement('td');
        roundTotalCell.classList.add('round-total-cell');
        roundTotalCell.textContent = '0';
        tr.appendChild(roundTotalCell);
        tbody.appendChild(tr);
        // Recalculer les totaux
        calculateTotals();
        updateCompletionTicks();
        updateCellTicks();
    }

    // Calcule les totaux pour chaque joueur et pour chaque manche
    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const tbodyRows = table.querySelectorAll('tbody tr');
        const playerCount = table.querySelectorAll('thead th').length - 2;
        const playerTotals = new Array(playerCount).fill(0);
        tbodyRows.forEach((row) => {
            let roundSum = 0;
            const inputs = row.querySelectorAll('input');
            inputs.forEach((input) => {
                const value = parseInt(input.value, 10) || 0;
                const index = parseInt(input.dataset.playerIndex, 10);
                playerTotals[index] += value;
                roundSum += value;
            });
            const roundTotalCell = row.querySelector('.round-total-cell');
            if (roundTotalCell) {
                roundTotalCell.textContent = roundSum.toString();
            }
        });
        const totalCells = table.querySelectorAll('.total-cell');
        totalCells.forEach((cell) => {
            const index = parseInt(cell.dataset.playerIndex, 10);
            cell.textContent = playerTotals[index].toString();
        });
        updateCompletionTicks();
        updateCellTicks();
    }

    // Met à jour l'indicateur de complétion sur l'en‑tête si un joueur a rempli toutes les cases
    function updateCompletionTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const headers = table.querySelectorAll('thead th');
        const playerCount = headers.length - 2;
        const filled = new Array(playerCount).fill(true);
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

    // Met à jour l'état des cellules pour afficher une coche verte lorsque la case est remplie
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

    // Bouton pour ajouter une manche supplémentaire
    addRoundBtn.addEventListener('click', () => {
        addRound();
    });
});