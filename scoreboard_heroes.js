// Script de comptage des scores pour Cartographers : Heroes

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');
    // Bouton de rejouer, utilisons let pour pouvoir le réassigner après clonage
    let replayButton = document.getElementById('replay-btn');

    // Génère dynamiquement les champs de nom en fonction du nombre de joueurs
    function updatePlayerNameFields() {
        playerNamesContainer.innerHTML = '';
        const count = parseInt(playerCountInput.value, 10);
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.classList.add('player-name-field');
            const label = document.createElement('label');
            label.htmlFor = `player-${i}`;
            label.textContent = `Joueur ${i + 1} :`;
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

    // Gérer la soumission du formulaire de préparation
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

    // Génère le tableau des scores pour Cartographers : Heroes
    // Le jeu se déroule en quatre saisons. Pour chaque saison, on saisit les points
    // des deux objectifs concernés, le nombre de pièces et les points de monstres
    // (négatifs). Les totaux par joueur sont calculés en faisant la somme des
    // objectifs et des pièces, puis en soustrayant les monstres.
    function generateScoreboard(players) {
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En‑tête : première cellule vide + une cellule par joueur
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
        // Corps : une série de lignes pour chaque saison
        const tbody = document.createElement('tbody');
        // Chaque saison a désormais deux lignes d'objectifs distincts au lieu d'une ligne combinée
        const seasons = [
            { name: 'Printemps', objectives: ['A', 'B'] },
            { name: 'Été',       objectives: ['B', 'C'] },
            { name: 'Automne',   objectives: ['C', 'D'] },
            { name: 'Hiver',     objectives: ['D', 'A'] }
        ];
        // Créer pour chaque saison : deux lignes d'objectifs (une par lettre), une ligne de pièces et une ligne de monstres
        let rowCounter = 0;
        seasons.forEach((season) => {
            // Lignes des objectifs pour la saison (une par lettre)
            season.objectives.forEach((letter) => {
                const objRow = document.createElement('tr');
                const objLabel = document.createElement('th');
                objLabel.textContent = `${season.name} – Objectif ${letter}`;
                objRow.appendChild(objLabel);
                players.forEach((player, pIndex) => {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '0';
                    input.value = '';
                    input.dataset.playerIndex = pIndex;
                    input.dataset.rowIndex = rowCounter;
                    input.dataset.role = 'objectives';
                    input.addEventListener('input', calculateTotals);
                    td.appendChild(input);
                    objRow.appendChild(td);
                });
                tbody.appendChild(objRow);
                rowCounter++;
            });
            // Ligne des pièces pour la saison
            const coinRow = document.createElement('tr');
            const coinLabel = document.createElement('th');
            coinLabel.textContent = `${season.name} – Pièces`;
            coinRow.appendChild(coinLabel);
            players.forEach((player, pIndex) => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.value = '';
                input.dataset.playerIndex = pIndex;
                input.dataset.rowIndex = rowCounter;
                input.dataset.role = 'coins';
                input.addEventListener('input', calculateTotals);
                td.appendChild(input);
                coinRow.appendChild(td);
            });
            tbody.appendChild(coinRow);
            rowCounter++;
            // Ligne des monstres pour la saison
            const monsterRow = document.createElement('tr');
            monsterRow.classList.add('monster-row');
            const monsterLabel = document.createElement('th');
            monsterLabel.textContent = `${season.name} – Monstres`;
            monsterRow.appendChild(monsterLabel);
            players.forEach((player, pIndex) => {
                const td = document.createElement('td');
                td.classList.add('monster-cell');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.value = '';
                input.dataset.playerIndex = pIndex;
                input.dataset.rowIndex = rowCounter;
                input.dataset.role = 'monsters';
                input.addEventListener('input', calculateTotals);
                td.appendChild(input);
                monsterRow.appendChild(td);
            });
            tbody.appendChild(monsterRow);
            rowCounter++;
        });
        table.appendChild(tbody);
        // Pied : ligne des totaux par joueur
        const tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        const totalLabel = document.createElement('th');
        totalLabel.textContent = 'Total';
        totalRow.appendChild(totalLabel);
        players.forEach((player, pIndex) => {
            const td = document.createElement('td');
            td.classList.add('total-cell');
            td.dataset.playerIndex = pIndex;
            td.textContent = '0';
            totalRow.appendChild(td);
        });
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);
        // Injection et initialisation
        scoreboardContainer.innerHTML = '';
        scoreboardContainer.appendChild(table);
        calculateTotals();
        updateCompletionTicks();
        updateCellTicks();
    }

    // Calcule les totaux pour chaque joueur
    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const playerCount = table.querySelectorAll('thead th').length - 1;
        const totals = new Array(playerCount).fill(0);
        // Additionner les scores : objectifs et pièces ajoutent des points, les monstres en retirent
        const inputs = table.querySelectorAll('tbody input');
        inputs.forEach((input) => {
            const pIndex = parseInt(input.dataset.playerIndex, 10);
            const val = parseInt(input.value, 10) || 0;
            const role = input.dataset.role;
            if (role === 'monsters') {
                totals[pIndex] -= val;
            } else {
                totals[pIndex] += val;
            }
        });
        // Mettre à jour les cellules de total
        const totalCells = table.querySelectorAll('.total-cell');
        totalCells.forEach((cell) => {
            const pIndex = parseInt(cell.dataset.playerIndex, 10);
            cell.textContent = totals[pIndex].toString();
        });
        updateCompletionTicks();
        updateCellTicks();
    }

    // Met à jour l'indicateur de complétion : une coche verte apparaît lorsque toutes les
    // cellules d'un joueur sont renseignées (même avec 0)
    function updateCompletionTicks() {
        const table = scoreboardContainer.querySelector('table');
        if (!table) return;
        const headers = table.querySelectorAll('thead th');
        const playerCount = headers.length - 1;
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

    /**
     * Met à jour les coches de chaque cellule de score. Les cellules dont
     * l'entrée est non vide reçoivent la classe « filled » pour afficher
     * une coche verte grâce au CSS.
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
});
