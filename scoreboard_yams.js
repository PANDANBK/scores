// Script pour gérer la feuille de score du Yams (Yahtzee)

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');

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
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.value = '0';
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
        const inputs = table.querySelectorAll('input');
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
    }
});