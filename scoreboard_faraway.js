// Script de comptage des scores pour Faraway

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');

    // Fonction pour mettre à jour les champs de noms de joueurs selon le nombre de joueurs
    function updatePlayerNameFields() {
        playerNamesContainer.innerHTML = '';
        const count = parseInt(playerCountInput.value, 10);
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.classList.add('player-name-field');
            const label = document.createElement('label');
            label.textContent = `Joueur ${i + 1} :`;
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

    function generateScoreboard(players) {
        // Définition des lignes du score pour Faraway
        const rowLabels = [
            'Carte 1',
            'Carte 2',
            'Carte 3',
            'Carte 4',
            'Carte 5',
            'Carte 6',
            'Carte 7',
            'Carte 8',
            'Sanctuaires'
        ];
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En-tête
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        // Première cellule vide pour l'intitulé des lignes
        const emptyHeadCell = document.createElement('th');
        emptyHeadCell.textContent = '';
        headerRow.appendChild(emptyHeadCell);
        // Une cellule d'en-tête par joueur
        players.forEach((player) => {
            const th = document.createElement('th');
            th.textContent = player;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Corps
        const tbody = document.createElement('tbody');
        rowLabels.forEach((label, rowIndex) => {
            const tr = document.createElement('tr');
            const labelCell = document.createElement('th');
            labelCell.textContent = label;
            tr.appendChild(labelCell);
            for (let i = 0; i < players.length; i++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.value = '0';
                input.dataset.playerIndex = i;
                input.dataset.rowIndex = rowIndex;
                input.addEventListener('input', calculateTotals);
                td.appendChild(input);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        // Pied avec totaux par joueur
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
        calculateTotals();
    }

    // Fonction pour calculer les totaux
    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const rows = table.querySelectorAll('tbody tr');
        // Le nombre de joueurs est égal au nombre de cellules d'en-tête moins une (la première sert de libellé de ligne)
        const playerCount = table.querySelectorAll('thead th').length - 1;
        const playerTotals = new Array(playerCount).fill(0);
        rows.forEach((row) => {
            const inputs = row.querySelectorAll('input');
            inputs.forEach((input) => {
                const value = parseInt(input.value, 10) || 0;
                const index = parseInt(input.dataset.playerIndex, 10);
                playerTotals[index] += value;
            });
        });
        const totalCells = table.querySelectorAll('.total-cell');
        totalCells.forEach((cell) => {
            const index = parseInt(cell.dataset.playerIndex, 10);
            cell.textContent = playerTotals[index].toString();
        });
    }
});