
// --- 1. JSON DE CARTAS BÁSICAS ---
const CARDS_DB = [
    { "id": "rey_1", "name": "Rey", "type": "Rey", "location": "earth", "attack": { "type": "none", "damage": 0 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 3 } },
    { "id": "soldado_1", "name": "Soldado", "type": "Tropa", "location": "earth", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "self", "value": 1 }, "health": { "type": "lives", "value": 2 } },
    { "id": "arquero_1", "name": "Arquero", "type": "Tropa", "location": "earth", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 1 } },
    { "id": "caballero_1", "name": "Caballero", "type": "Tropa", "location": "earth", "attack": { "type": "2", "damage": 2 }, "defense": { "type": "self", "value": 1 }, "health": { "type": "lives", "value": 2 } },
    { "id": "halcon_1", "name": "Halcón", "type": "Tropa", "location": "air", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 1 } },
    { "id": "bonus_espada", "name": "Espada +1 ATQ", "type": "Bonus", "location": "none", "attack": { "type": "auto", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "turns", "value": 2 } },
    { "id": "especial_rayo", "name": "Rayo (3 Dmg)", "type": "Especial", "location": "none", "attack": { "type": "1", "damage": 3 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "attacks", "value": 1 } },
    { "id": "soporte_escudo", "name": "Escudero (Def.2)", "type": "Soporte", "location": "earth", "attack": { "type": "none", "damage": 0 }, "defense": { "type": "others", "value": 2 }, "health": { "type": "turns", "value": 3 } }
];

// --- 2. CLASES DEL MOTOR ---
class Card {
    constructor(config) {
        Object.assign(this, config);
        this.id = config.id + Math.random().toString(36).substring(7); // ID único
        this.currentHealth = config.health.value;
        this.position = { x: null, y: null };
        this.attachedCards = []; // Nueva propiedad solicitada
    }
}

class Board {
    constructor(playerId) {
        this.playerId = playerId; // 0: Izquierda, 1: Derecha
        this.earth = Array(3).fill(null).map(() => Array(3).fill(null));
        this.air = Array(3).fill(null).map(() => Array(3).fill(null));
        this.maxCards = 8;
    }

    getDirection() { return this.playerId === 0 ? 1 : -1; }
    getFrontRow() { return this.playerId === 0 ? 2 : 0; }
    getBackRow() { return this.playerId === 0 ? 0 : 2; }

    // Regla: Cabeza de fila (Primera carta de cada fila)
    getHeads() {
        const heads = [];
        for (let x = 0; x < 3; x++) {
            for (let layer of ['earth', 'air']) {
                const grid = this[layer];
                let head = null;
                for (let y = 0; y < 3; y++) {
                    if (grid[x][y]) {
                        head = grid[x][y];
                        if (this.playerId === 0 && y === 2) break;
                        if (this.playerId === 1 && y === 0) break;
                    }
                }
                if (head) heads.push(head);
            }
        }
        return heads;
    }

    isCovered(card) {
        const dir = this.getDirection();
        const nextY = card.position.y + dir;
        if (nextY < 0 || nextY > 2) return false;
        return this[card.location === 'air' ? 'air' : 'earth'][card.position.x][nextY] !== null;
    }

    // Regla: Solo las 2 primeras filas son vulnerables
    isVulnerable(card) {
        if (card.position.y === this.getBackRow()) return false;
        return !this.isCovered(card);
    }
}

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.board = new Board(id);
        this.hand = [];
        this.maxHandSize = 5;
    }
}

class GameEngine {
    constructor(playerCount = 2) {
        this.players = [];
        this.turn = 0;
        this.state = 'MENU';

        // Inicializar jugadores
        for (let i = 0; i < playerCount; i++) {
            const p = new Player(i, `Jugador ${i + 1}`);
            const reyConfig = CARDS_DB.find(c => c.type === 'Rey');
            const rey = new Card(reyConfig);
            p.board.earth[p.board.getFrontRow()][1] = rey;
            rey.position = { x: p.board.getFrontRow(), y: 1, location: 'earth' };
            this.players.push(p);

            // Mano inicial de 5 cartas
            for (let j = 0; j < 5; j++) {
                const randomCard = CARDS_DB[Math.floor(Math.random() * CARDS_DB.length)];
                p.hand.push(new Card(randomCard));
            }
        }
        this.state = 'PLAYING';
    }

    getCurrentPlayer() { return this.players[this.turn]; }
    getEnemies(player) { return this.players.filter(p => p.id !== player.id); }

    playCard(playerIndex, cardIndex, x, y, isAir, targetCardId = null) {
        const player = this.players[playerIndex];
        const card = player.hand[cardIndex];

        if (card.type === 'Bonus') {
            if (!targetCardId) { log("Debes seleccionar una tropa aliada para equipar la Bonus."); return; }
            // Encontrar la tropa en el tablero
            let target = this.findCardById(player, targetCardId);
            if (!target) { log("Tropa no encontrada."); return; }

            // Equipar bonus
            target.attachedCards.push(card);
            player.hand.splice(cardIndex, 1);
            log(`${player.name} equipó ${card.name} a ${target.name}.`);
            this.nextTurn();
            return;
        }

        // Regla: Debe estar junto a otra carta
        if (!this.isAdjacent(player.board, x, y, isAir)) {
            log("Debe colocarse junto a otra carta (adyacencia)."); return;
        }

        // Regla: Máximo 8 por capa
        const layer = isAir ? player.board.air : player.board.earth;
        let count = 0;
        layer.forEach(row => row.forEach(c => { if (c) count++; }));
        if (count >= player.board.maxCards) { log("Límite de 8 cartas en esta capa alcanzado."); return; }

        // Colocar carta
        layer[x][y] = card;
        card.position = { x, y, location: isAir ? 'air' : 'earth' };
        player.hand.splice(cardIndex, 1);

        log(`${player.name} colocó ${card.name}.`);

        // Regla: Tropas, Bonus y Especiales gastan turno
        if (['Tropa', 'Bonus', 'Especial'].includes(card.type)) this.nextTurn();
    }

    isAdjacent(board, x, y, isAir) {
        // Verificar si hay alguna carta en las celdas adyacentes (arriba, abajo, izq, der)
        const grid = isAir ? board.air : board.earth;
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3 && grid[nx][ny]) return true;
        }
        return false;
    }

    attack(attackerId, targetId) {
        const player = this.getCurrentPlayer();
        const enemy = this.getEnemies(player)[0];

        const attacker = this.findCardById(player, attackerId);
        const target = this.findCardById(enemy, targetId);

        if (!attacker || !target) { log("Carta no encontrada."); return; }
        if (!player.board.getHeads().includes(attacker)) { log("Solo la cabeza de cada fila puede atacar."); return; }
        if (!enemy.board.isVulnerable(target) && attacker.location !== 'air') {
            log("El objetivo está cubierto o en fila segura."); return;
        }

        // Regla de Aire: Solo atacan ambas capas, pero no pueden atacar la retaguardia si las reglas dicen que no es vulnerable.
        if (target.position.y === enemy.board.getBackRow()) {
            log("La fila trasera es invulnerable.");
            return;
        }

        // Resolución del Ataque
        let damage = attacker.attack.damage;
        // Bonus equipados
        attacker.attachedCards.forEach(bonus => {
            if (bonus.attack.type === 'auto') damage += bonus.attack.damage;
        });

        // Defensa a otros (Elección del defensor)
        let defenderCard = target;
        const defendingAlly = this.findDefenders(enemy, target);
        if (defendingAlly) {
            if (confirm(`¿Usar a ${defendingAlly.name} para defender a ${target.name}?`)) {
                defenderCard = defendingAlly;
            }
        }

        log(`${player.name} ataca a ${enemy.name} con ${attacker.name} causando ${damage} de daño a ${defenderCard.name}.`);

        // Defensa propia: Devolver daño (Si es ataque físico)
        if (defenderCard.defense.type === 'self' && attacker.location !== 'air') {
            log(`${defenderCard.name} se defiende y devuelve ${defenderCard.defense.value} de daño a ${attacker.name}.`);
            attacker.currentHealth -= defenderCard.defense.value;
            if (attacker.currentHealth <= 0) this.removeCard(player, attacker);
        }

        // Aplicar daño
        defenderCard.currentHealth -= damage;
        if (defenderCard.currentHealth <= 0) {
            log(`${defenderCard.name} ha sido eliminada.`);
            this.removeCard(enemy, defenderCard);
            // Regla: Recibe 1 carta de bonificación por eliminar
            this.drawBonusCards(player, 1);
        }

        // Regla: Turnos y ataques (salud)
        this.checkHealthTypes(attacker, player);
        this.checkHealthTypes(defenderCard, enemy);

        this.nextTurn();
    }

    findDefenders(enemy, target) {
        // Busca cartas con 'others' alrededor del objetivo
        const grid = enemy.board[target.location];
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (let [dx, dy] of dirs) {
            const nx = target.position.x + dx, ny = target.position.y + dy;
            if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3 && grid[nx][ny]) {
                if (grid[nx][ny].defense.type === 'others') return grid[nx][ny];
            }
        }
        return null;
    }

    removeCard(player, card) {
        const grid = player.board[card.location];
        grid[card.position.x][card.position.y] = null;
    }

    checkHealthTypes(card, player) {
        if (!card) return;
        if (card.health.type === 'turns') {
            // Se pierde al pasar el turno (esto se manejaría en nextTurn de forma global)
        } else if (card.health.type === 'attacks') {
            if (card.currentHealth <= 0) { /* Ya eliminado */ }
        }
    }

    // Regla de robo de cartas
    drawBonusCards(player, count) {
        for (let i = 0; i < count; i++) {
            const randomCard = new Card(CARDS_DB[Math.floor(Math.random() * CARDS_DB.length)]);
            if (player.hand.length >= player.maxHandSize) {
                // Si ya tiene el máximo, la recibe su enemigo
                const enemy = this.getEnemies(player)[0];
                log(`La mano de ${player.name} está llena. ¡${enemy.name} recibe la carta de bonificación!`);
                enemy.hand.push(randomCard);
            } else {
                player.hand.push(randomCard);
            }
        }
    }

    // Regla especial: Si no tiene cartas y no puede atacar, recibe 3
    checkDespairDraw(player) {
        if (player.hand.length === 0 && player.board.getHeads().length === 0) {
            log(`${player.name} está en desesperación y roba 3 cartas.`);
            this.drawBonusCards(player, 3);
        }
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.players.length;
        const player = this.getCurrentPlayer();
        this.checkDespairDraw(player);
        UI.render();
    }

    findCardById(player, id) {
        for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) {
            const earth = player.board.earth[x][y];
            const air = player.board.air[x][y];
            if (earth && earth.id === id) return earth;
            if (air && air.id === id) return air;
        }
        return null;
    }
}

// --- 3. INTERFAZ DE USUARIO ---
const UI = {
    engine: null,
    selectedCard: null,
    pendingBonus: false,
    pendingAttack: false,

    init(playerCount) {
        this.engine = new GameEngine(playerCount);
        this.render();
        log("¡Comienza la Batalla de Reinos!");
    },

    log(msg) {
        const logs = document.getElementById('logs');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `[Turno ${this.engine.turn + 1}] ${msg}`;
        logs.appendChild(entry);
    },

    render() {
        const p1Div = document.getElementById('player1');
        const p2Div = document.getElementById('player2');

        // Renderizar tableros
        p1Div.innerHTML = this.renderBoard(this.engine.players[0]);
        p2Div.innerHTML = this.renderBoard(this.engine.players[1]);

        // Renderizar mano del jugador actual
        const handArea = document.getElementById('hand-area');
        const current = this.engine.getCurrentPlayer();
        handArea.innerHTML = `<h3>Mano de ${current.name}</h3>`;
        current.hand.forEach((card, i) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'hand-card';
            cardEl.textContent = `${card.name} (${card.type})`;
            cardEl.onclick = () => this.selectCardFromHand(card, i);
            handArea.appendChild(cardEl);
        });

        // Resaltar cabezas de fila como atacantes legales
        this.highlightAttackers(current);
    },

    renderBoard(player) {
        let html = `<h2>${player.name}</h2>`;
        for (let layer of ['earth', 'air']) {
            html += `<div class="grid ${layer === 'air' ? 'air' : ''}">`;
            const grid = player.board[layer];
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    const card = grid[x][y];
                    html += `<div class="cell" id="cell-${player.id}-${layer}-${x}-${y}" onclick="UI.cellClicked('${player.id}', '${layer}', ${x}, ${y})">`;
                    if (card) {
                        let cardHTML = `<div class="card ${card.type.toLowerCase()}">${card.name}`;
                        if (card.attachedCards.length > 0) cardHTML += `<br><small>[Bonus: ${card.attachedCards.map(b => b.name).join(', ')}]</small>`;
                        cardHTML += `<br>Vida: ${card.currentHealth}</div>`;
                        html += cardHTML;
                    }
                    html += `</div>`;
                }
            }
            html += `</div>`;
        }
        return html;
    },

    cellClicked(playerId, layer, x, y) {
        const player = this.engine.players.find(p => p.id == playerId);
        const current = this.engine.getCurrentPlayer();
        const enemy = this.engine.getEnemies(current)[0];

        const grid = player.board[layer];
        const targetCard = grid[x][y];

        // Lógica para colocar cartas en propio tablero
        if (player.id === current.id && this.selectedCard) {
            this.engine.playCard(current.id, this.selectedCardIndex, x, y, layer === 'air');
            this.selectedCard = null;
            this.render();
            return;
        }

        // Lógica para equipar carta Bonus
        if (player.id === current.id && this.pendingBonus && targetCard) {
            this.engine.playCard(current.id, this.selectedCardIndex, x, y, layer === 'air', targetCard.id);
            this.pendingBonus = false;
            this.selectedCard = null;
            this.render();
            return;
        }

        // Lógica para atacar
        if (player.id === enemy.id && this.pendingAttack && targetCard) {
            this.engine.attack(this.selectedCardId, targetCard.id);
            this.pendingAttack = false;
            this.render();
            return;
        }
    },

    selectCardFromHand(card, index) {
        const current = this.engine.getCurrentPlayer();
        this.selectedCard = card;
        this.selectedCardIndex = index;
        this.selectedCardId = null;

        if (card.type === 'Bonus') {
            this.pendingBonus = true;
            log("Selecciona una Tropa aliada para equipar la carta Bonus.");
        } else {
            log("Selecciona una casilla en tu tablero para colocar la carta.");
        }
    },

    highlightAttackers(player) {
        // Resaltar cabezas de fila y objetivo vulnerable
        const heads = player.board.getHeads();
        heads.forEach(card => {
            const cell = document.getElementById(`cell-${player.id}-${card.location}-${card.position.x}-${card.position.y}`);
            if (cell) cell.querySelector('.card').classList.add('attacker');
            cell.onclick = () => {
                this.pendingAttack = true;
                this.selectedCardId = card.id;
                log(`Selecciona un objetivo enemigo para atacar con ${card.name}.`);
            };
        });

        const enemy = this.engine.getEnemies(player)[0];
        if (this.pendingAttack) {
            // Pintar objetivos potenciales
            enemy.board.earth.forEach((row, x) => row.forEach((cell, y) => {
                if (cell && enemy.board.isVulnerable(cell) && cell.position.y !== enemy.board.getBackRow()) {
                    const cellEl = document.getElementById(`cell-${enemy.id}-earth-${x}-${y}`);
                    if (cellEl) cellEl.querySelector('.card').classList.add('vulnerable');
                }
            }));
        }
    }
};

// --- 4. INICIALIZACIÓN ---
// Menú Inicio (por defecto inicia con 2 jugadores)
document.addEventListener('DOMContentLoaded', () => {
    // Añadir botón de menú simple
    const startBtn = document.createElement('button');
    startBtn.textContent = "Iniciar Partida (2 Jugadores)";
    document.body.prepend(startBtn);
    startBtn.onclick = () => UI.init(2);

    // Logs iniciales
    const logsDiv = document.createElement('div');
    logsDiv.id = 'logs';
    document.body.appendChild(logsDiv);

    const container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);

    const handDiv = document.createElement('div');
    handDiv.id = 'hand-area';
    document.body.appendChild(handDiv);

    // Log global
    window.log = UI.log;
});