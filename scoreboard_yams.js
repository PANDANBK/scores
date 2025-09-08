// Script pour gérer la feuille de score du Yams (Yahtzee)

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');
    // Bouton de rejouer : nous utilisons un let pour pouvoir le réassigner après clonage
    let replayButton = document.getElementById('replay-btn');

    function updatePlayerNameFields() {
        playerNamesContainer.innerHTML = '';
        const count = parseInt(playerCountInput.value, 10);
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.classList.add('player-name-field');
            const label = document.createElement('label');
            label.htmlFor = `player-${i}`;
            label.textContent = `Joueur ${i + 1} :`;
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
        // Afficher le bouton de rejouer et configurer son évènement
        replayButton.classList.remove('hidden');
        // Cloner le bouton pour supprimer d'éventuels anciens gestionnaires d'événements
        const newButton = replayButton.cloneNode(true);
        replayButton.parentNode.replaceChild(newButton, replayButton);
        replayButton = newButton;
        // Lorsqu'on clique sur "Rejouer", demander confirmation avant de réinitialiser
        replayButton.addEventListener('click', () => {
            const confirmed = window.confirm('Confirmez‑vous vouloir rejouer ? Les scores seront effacés.');
            if (confirmed) {
                generateScoreboard(playerNames);
            }
        });
    });

    // Liste des catégories et type (upper: section supérieure / première partie, lower: section inférieure)
    const categories = [
        { name: 'As (1)', type: 'upper' },
        { name: 'Deux (2)', type: 'upper' },
        { name: 'Trois (3)', type: 'upper' },
        { name: 'Quatre (4)', type: 'upper' },
        { name: 'Cinq (5)', type: 'upper' },
        { name: 'Six (6)', type: 'upper' },
        { name: 'Sous-total (1-6)', type: 'computed' },
        { name: 'Bonus (>=63 -> +35)', type: 'computed' },
        { name: 'Brelan', type: 'lower' },
        { name: 'Carré', type: 'lower' },
        { name: 'Full (25)', type: 'lower' },
        { name: 'Petite suite (20)', type: 'lower' },
        { name: 'Grande suite (40)', type: 'lower' },
        { name: 'Yam’s (50)', type: 'lower' },
        { name: 'Chance', type: 'lower' },
        { name: 'Total général', type: 'computed' }
    ];

    // Définition des valeurs possibles pour les catégories de la section supérieure (1 à 6)
    // Chaque sous-tableau représente les points possibles pour la catégorie correspondante (As -> Six).
    const upperSelectOptions = [
        [0, 1, 2, 3, 4, 5],       // As (1)
        [0, 2, 4, 6, 8, 10],      // Deux (2)
        [0, 3, 6, 9, 12, 15],     // Trois (3)
        [0, 4, 8, 12, 16, 20],    // Quatre (4)
        [0, 5, 10, 15, 20, 25],   // Cinq (5)
        [0, 6, 12, 18, 24, 30]    // Six (6)
    ];

    function generateScoreboard(players) {
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En-tête
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const emptyHead = document.createElement('th');
        emptyHead.textContent = '';
        headerRow.appendChild(emptyHead);
        players.forEach((player) => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Corps
        const tbody = document.createElement('tbody');
        categories.forEach((cat, rowIndex) => {
            const tr = document.createElement('tr');
            const labelCell = document.createElement('th');
            labelCell.textContent = cat.name;
            tr.appendChild(labelCell);
            players.forEach((player, pIndex) => {
                const td = document.createElement('td');
                if (cat.type === 'computed') {
                    // cellule calculée
                    const span = document.createElement('span');
                    span.classList.add('computed-cell');
                    span.dataset.playerIndex = pIndex;
                    span.dataset.rowIndex = rowIndex;
                    span.textContent = '0';
                    td.appendChild(span);
                } else if (cat.type === 'upper') {
                    // pour les catégories de la section supérieure, utiliser un menu déroulant avec des valeurs prédéfinies
                    const select = document.createElement('select');
                    select.dataset.playerIndex = pIndex;
                    select.dataset.rowIndex = rowIndex;
                    // options issues de upperSelectOptions selon l'index de catégorie
                    // On insère d'abord une option vide pour que la valeur initiale soit vide (pas de 0 affiché)
                    const emptyOption = document.createElement('option');
                    emptyOption.value = '';
                    emptyOption.textContent = '';
                    select.appendChild(emptyOption);
                    const values = upperSelectOptions[rowIndex];
                    values.forEach((val) => {
                        const option = document.createElement('option');
                        option.value = val.toString();
                        option.textContent = val.toString();
                        select.appendChild(option);
                    });
                    // Pas de valeur sélectionnée par défaut ; la cellule reste vide
                    select.addEventListener('change', calculateTotals);
                    td.appendChild(select);
                } else {
                    // catégories de la section inférieure : champ numérique libre
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.value = '';
                    input.dataset.playerIndex = pIndex;
                    input.dataset.rowIndex = rowIndex;
                    input.addEventListener('input', calculateTotals);
                    td.appendChild(input);
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        scoreboardContainer.innerHTML = '';
        scoreboardContainer.appendChild(table);
        // Calcul initial
        calculateTotals();
        // Mettre à jour les coches de complétion après la génération du tableau
        updateCompletionTicks();
        // Mettre à jour les coches au niveau des cellules individuellement
        updateCellTicks();
    }

    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const playerCount = table.querySelectorAll('thead th').length - 1;
        // Créer structures pour totaux
        const upperSums = new Array(playerCount).fill(0);
        const lowerSum = new Array(playerCount).fill(0);
        const fullData = new Array(playerCount).fill(0);
        // Parcourir chaque cellule d'entrée
        // Récupérer toutes les entrées numériques et menus déroulants
        const inputs = table.querySelectorAll('input, select');
        inputs.forEach((input) => {
            const playerIndex = parseInt(input.dataset.playerIndex, 10);
            const rowIndex = parseInt(input.dataset.rowIndex, 10);
            const value = parseInt(input.value, 10) || 0;
            const category = categories[rowIndex];
            if (category.type === 'upper') {
                upperSums[playerIndex] += value;
            } else if (category.type === 'lower') {
                lowerSum[playerIndex] += value;
            }
        });
        // Mettre à jour les cellules calculées
        categories.forEach((cat, rowIndex) => {
            if (cat.type === 'computed') {
                // récupérer toutes les computed-cells correspondant à ce rowIndex
                const spans = table.querySelectorAll(`span[data-row-index='${rowIndex}']`);
                spans.forEach((span) => {
                    const playerIndex = parseInt(span.dataset.playerIndex, 10);
                    let value = 0;
                    if (cat.name.startsWith('Sous-total')) {
                        value = upperSums[playerIndex];
                    } else if (cat.name.startsWith('Bonus')) {
                        value = upperSums[playerIndex] >= 63 ? 35 : 0;
                    } else if (cat.name.startsWith('Total général')) {
                        const bonus = upperSums[playerIndex] >= 63 ? 35 : 0;
                        value = upperSums[playerIndex] + bonus + lowerSum[playerIndex];
                    }
                    span.textContent = value.toString();
                });
            }
        });
        // Mettre à jour les coches après recalcul des totaux
        updateCompletionTicks();
        // Mettre à jour les coches au niveau des cellules
        updateCellTicks();
    }

    /**
     * Parcourt chaque colonne de joueur et vérifie si toutes les cases de score
     * sont renseignées (y compris 0). Si c'est le cas, ajoute la classe
     * « completed » à l'en‑tête correspondant afin d'afficher une coche verte.
     */
    function updateCompletionTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const headers = table.querySelectorAll('thead th');
        const playerCount = headers.length - 1;
        const filled = new Array(playerCount).fill(true);
        const inputs = table.querySelectorAll('input, select');
        inputs.forEach((element) => {
            const pIndex = parseInt(element.dataset.playerIndex, 10);
            if (element.value === '' || element.value === undefined) {
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
     * Met à jour les coches de chaque cellule de score. Si la valeur de
     * l'entrée ou du menu déroulant est non vide, la classe « filled » est
     * ajoutée à la cellule <td> afin d'afficher une coche verte via CSS.
     */
    function updateCellTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const cells = table.querySelectorAll('tbody td');
        cells.forEach((td) => {
            const input = td.querySelector('input, select');
            if (!input) return;
            if (input.value !== '' && input.value !== undefined) {
                td.classList.add('filled');
            } else {
                td.classList.remove('filled');
            }
        });
    }
});