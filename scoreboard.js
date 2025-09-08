// Ce script gère la logique du compteur de scores.

// Fonction utilitaire pour récupérer le nom du jeu depuis l'URL.
function getGameName() {
    const params = new URLSearchParams(window.location.search);
    const game = params.get('game') || 'jeu';
    // Transforme une chaîne slugifiée en quelque chose de plus lisible.
    return game
        .replace(/_/g, ' ')
        .replace(/\b(\w)/g, c => c.toUpperCase());
}

document.addEventListener('DOMContentLoaded', () => {
    const gameTitle = document.getElementById('game-title');
    gameTitle.textContent = `Compteur de scores – ${getGameName()}`;

    const setupForm = document.getElementById('setup-form');
    const playerCountInput = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoreSection = document.getElementById('score-section');
    const scoreboardContainer = document.getElementById('scoreboard-container');
    const addRoundBtn = document.getElementById('add-round-btn');

    // Mettre à jour dynamiquement les champs de noms de joueurs selon le nombre de joueurs
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

    // Initialiser les champs pour le nombre de joueurs par défaut.
    updatePlayerNameFields();
    playerCountInput.addEventListener('change', updatePlayerNameFields);

    // Gère la soumission du formulaire de préparation de partie.
    setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playerCount = parseInt(playerCountInput.value, 10);
        const playerNames = [];
        for (let i = 0; i < playerCount; i++) {
            const input = document.getElementById(`player-${i}`);
            const name = input.value.trim() || `Joueur ${i + 1}`;
            playerNames.push(name);
        }
        // Masquer la section de préparation, afficher la feuille de score.
        document.getElementById('setup-section').classList.add('hidden');
        scoreSection.classList.remove('hidden');
        // Générer la feuille de score initiale.
        generateScoreboard(playerNames);
    });

    // Crée et insère le tableau des scores pour les joueurs passés.
    function generateScoreboard(players) {
        const table = document.createElement('table');
        table.classList.add('scoreboard-table');
        // En-tête
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
        totalHeader.textContent = 'Total';
        headerRow.appendChild(totalHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Corps du tableau : nous commençons sans manche. Les manches seront ajoutées dynamiquement.
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        // Ajouter un pied de tableau pour les totaux cumulés par joueur.
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
        // Cellule pour total général (somme de toutes les manches)
        const totalAllCell = document.createElement('td');
        totalAllCell.textContent = '';
        totalRow.appendChild(totalAllCell);
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot);
        scoreboardContainer.innerHTML = '';
        scoreboardContainer.appendChild(table);
        // Ajoute un bouton pour ajouter la première manche.
        addRound();
    }

    // Ajoute une nouvelle manche au tableau des scores.
    function addRound() {
        const table = scoreboardContainer.querySelector('table');
        const tbody = table.querySelector('tbody');
        const playersCount = table.querySelectorAll('thead th').length - 2; // -2 pour 'Manche' et 'Total'
        const rowIndex = tbody.querySelectorAll('tr').length + 1;
        const tr = document.createElement('tr');
        const roundCell = document.createElement('th');
        roundCell.textContent = `Manche ${rowIndex}`;
        tr.appendChild(roundCell);
        for (let i = 0; i < playersCount; i++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.dataset.playerIndex = i;
            input.addEventListener('input', calculateTotals);
            td.appendChild(input);
            tr.appendChild(td);
        }
        // Cellule pour total de la manche.
        const roundTotalCell = document.createElement('td');
        roundTotalCell.classList.add('round-total-cell');
        roundTotalCell.textContent = '0';
        tr.appendChild(roundTotalCell);
        tbody.appendChild(tr);
        // Recalculer les totaux après avoir ajouté la manche.
        calculateTotals();
    }

    // Calcule les totaux par joueur et par manche.
    function calculateTotals() {
        const table = scoreboardContainer.querySelector('table');
        const tbodyRows = table.querySelectorAll('tbody tr');
        const playersCount = table.querySelectorAll('thead th').length - 2;
        // Totaux par joueur
        const playerTotals = new Array(playersCount).fill(0);
        // Parcourir chaque ligne (manche)
        tbodyRows.forEach((row) => {
            let roundSum = 0;
            const inputs = row.querySelectorAll('input');
            inputs.forEach((input) => {
                const value = parseInt(input.value, 10) || 0;
                const index = parseInt(input.dataset.playerIndex, 10);
                playerTotals[index] += value;
                roundSum += value;
            });
            // Mettre à jour total de la manche
            const roundTotalCell = row.querySelector('.round-total-cell');
            if (roundTotalCell) {
                roundTotalCell.textContent = roundSum.toString();
            }
        });
        // Mettre à jour la ligne des totaux par joueur
        const totalCells = table.querySelectorAll('.total-cell');
        totalCells.forEach((cell) => {
            const index = parseInt(cell.dataset.playerIndex, 10);
            cell.textContent = playerTotals[index].toString();
        });
    }

    // Bouton pour ajouter une nouvelle manche
    addRoundBtn.addEventListener('click', () => {
        addRound();
    });
});