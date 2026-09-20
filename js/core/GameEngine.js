import { Card } from './Card.js';
import { Player } from './Player.js';

/**
 * El motor no conoce el DOM ni la UI. Todo lo que necesita del exterior entra por `hooks`:
 *  - log(msg):                   recibe cada mensaje de juego.
 *  - onTurnChange():             se llama al cambiar de turno (la UI lo usa para re-renderizar).
 *  - confirmDefense(def, tgt):   pregunta si `def` debe defender a `tgt`; devuelve boolean.
 */
const DEFAULT_HOOKS = {
    log: () => { },
    onTurnChange: () => { },
    confirmDefense: () => false,
};

export class GameEngine {
    constructor({ cardsDb, playerCount = 2, modeName = 'Free For All', cols = 3, rows = 3, hooks = {} }) {
        this.cardsDb = cardsDb;
        this.hooks = { ...DEFAULT_HOOKS, ...hooks };
        this.players = []; this.turn = 0; this.state = 'PLAYING';
        this.modeName = modeName; this.turnCount = 1;
        this.cols = cols; this.rows = rows;
        const centerCol = Math.floor(cols / 2);
        const backRow = rows - 1;
        for (let i = 0; i < playerCount; i++) {
            const p = new Player(i, `Jugador ${i + 1}`, cols, rows);
            const reyConfig = this.cardsDb.find(c => c.type === 'Rey');
            const rey = new Card(reyConfig);
            p.board.earth[centerCol][backRow] = rey;
            rey.position = { x: centerCol, y: backRow, layer: 'earth' };
            this.players.push(p);
            for (let j = 0; j < 5; j++) p.hand.push(new Card(this.randomCardConfig()));
        }
    }
    log(msg) { this.hooks.log(msg); }
    randomCardConfig() { return this.cardsDb[Math.floor(Math.random() * this.cardsDb.length)]; }
    getCurrentPlayer() { return this.players[this.turn]; }
    getEnemies(player) { return this.players.filter(p => p.id !== player.id); }
    getPlayer(id) { return this.players.find(p => p.id === Number(id)); }

    playCard(playerIndex, cardIndex, x, y, targetCardId = null) {
        const player = this.players[playerIndex];
        const card = player.hand[cardIndex];
        if (!card) return false;
        const isAir = card.location === 'air';
        if (card.type === 'Bonus') {
            if (!targetCardId) { this.log("Selecciona una tropa para equipar la Bonus."); return false; }
            const target = this.findCardById(player, targetCardId);
            if (!target) { this.log("Tropa no encontrada."); return false; }
            target.attachedCards.push(card);
            player.hand.splice(cardIndex, 1);
            this.log(`${player.name} equipó ${card.name} a ${target.name}.`);
            this.nextTurn(); return true;
        }
        if (card.location === 'none') { this.log(`${card.name} es Especial; no puede colocarse.`); return false; }
        if (x < 0 || x >= player.board.cols || y < 0 || y >= player.board.rows) { this.log("Posición fuera del tablero."); return false; }
        const layer = isAir ? player.board.air : player.board.earth;
        if (layer[x][y]) { this.log(`Casilla ocupada en ${isAir ? 'aire' : 'tierra'}.`); return false; }
        const backRow = player.board.getBackRow();
        if (!isAir && y !== backRow) {
            if (!this.hasAdjacent(player.board.earth, x, y)) {
                this.log(`Solo la fila inferior (y=${backRow}) permite colocación libre. En otras filas necesitas una carta adyacente.`);
                return false;
            }
        }
        let count = 0;
        layer.forEach(col => col.forEach(c => { if (c) count++; }));
        if (count >= player.board.maxCards) { this.log("Límite de 8 cartas alcanzado."); return false; }
        layer[x][y] = card;
        card.position = { x, y, layer: isAir ? 'air' : 'earth' };
        player.hand.splice(cardIndex, 1);
        this.log(`${player.name} colocó ${card.name} en ${isAir ? 'Aire' : 'Tierra'} (${x},${y}).`);
        if (['Tropa', 'Bonus', 'Especial'].includes(card.type)) this.nextTurn();
        return true;
    }
    hasAdjacent(grid, x, y) {
        const cols = grid.length;
        const rows = grid[0].length;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny]) return true;
        }
        return false;
    }
    isHeadOfColumn(player, card) {
        const grid = player.board[card.position.layer];
        const { x, y } = card.position;
        for (let yy = 0; yy < y; yy++) if (grid[x][yy]) return false;
        return true;
    }
    attack(attackerId, targetId) {
        const player = this.getCurrentPlayer();
        const enemy = this.getEnemies(player)[0];
        const attacker = this.findCardById(player, attackerId);
        const target = this.findCardById(enemy, targetId);
        if (!attacker || !target) { this.log("Carta no encontrada."); return; }
        if (!this.isHeadOfColumn(player, attacker)) { this.log("Solo la primera carta de cada columna puede atacar."); return; }
        if (attacker.position.layer === 'earth' && target.position.layer === 'air') { this.log("Las cartas terrestres no pueden atacar a las aéreas."); return; }
        if (!enemy.board.canBeAttacked(target, attacker)) { this.log(`${target.name} no es atacable.`); return; }
        let damage = attacker.attack.damage;
        attacker.attachedCards.forEach(bonus => { if (bonus.attack.type === 'auto') damage += bonus.attack.damage; });
        let defenderCard = target;
        const defendingAlly = this.findDefenders(enemy, target);
        if (defendingAlly) {
            if (this.hooks.confirmDefense(defendingAlly, target)) defenderCard = defendingAlly;
        }
        const isDiagonal = attacker.position.x !== target.position.x;
        this.log(`${player.name} ataca ${isDiagonal ? 'DIAGONALMENTE ' : ''}con ${attacker.name} (${damage} dmg) a ${defenderCard.name}.`);
        if (defenderCard.defense.type === 'self' && attacker.position.layer !== 'air') {
            this.log(`${defenderCard.name} contraataca con ${defenderCard.defense.value} dmg.`);
            attacker.currentHealth -= defenderCard.defense.value;
            if (attacker.currentHealth <= 0) { this.log(`${attacker.name} ha caído.`); this.removeCard(player, attacker); }
        }
        defenderCard.currentHealth -= damage;
        if (defenderCard.currentHealth <= 0) {
            this.log(`${defenderCard.name} ha sido eliminada.`);
            this.removeCard(enemy, defenderCard);
            this.drawBonusCards(player, 1);
        }
        this.checkWinCondition();
        if (this.state !== 'OVER') this.nextTurn();
    }
    findDefenders(enemy, target) {
        const grid = enemy.board[target.position.layer];
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const cols = enemy.board.cols;
        const rows = enemy.board.rows;
        for (const [dx, dy] of dirs) {
            const nx = target.position.x + dx, ny = target.position.y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny]) {
                if (grid[nx][ny].defense.type === 'others') return grid[nx][ny];
            }
        }
        return null;
    }
    removeCard(player, card) { player.board[card.position.layer][card.position.x][card.position.y] = null; }
    drawBonusCards(player, count) {
        for (let i = 0; i < count; i++) {
            const randomCard = new Card(this.randomCardConfig());
            if (player.hand.length >= player.maxHandSize) {
                const enemy = this.getEnemies(player)[0];
                this.log(`Mano llena: ${enemy.name} recibe la bonificación.`);
                enemy.hand.push(randomCard);
            } else player.hand.push(randomCard);
        }
    }
    checkDespairDraw(player) {
        if (player.hand.length === 0 && player.board.getHeads().length === 0) {
            this.log(`${player.name} entra en desesperación: roba 3 cartas.`);
            this.drawBonusCards(player, 3);
        }
    }
    checkWinCondition() {
        for (const player of this.players) {
            let kingAlive = false;
            for (let x = 0; x < player.board.cols; x++) for (let y = 0; y < player.board.rows; y++) {
                const c = player.board.earth[x][y];
                if (c && c.type === 'Rey') kingAlive = true;
            }
            if (!kingAlive) {
                const winner = this.players.find(p => p.id !== player.id);
                this.log(`¡${player.name} perdió su Rey! ¡${winner.name} GANA!`);
                this.state = 'OVER'; return;
            }
        }
    }
    nextTurn() {
        this.turnCount++;
        this.turn = (this.turn + 1) % this.players.length;
        this.checkDespairDraw(this.getCurrentPlayer());
        this.hooks.onTurnChange();
    }
    findCardById(player, id) {
        for (let x = 0; x < player.board.cols; x++) for (let y = 0; y < player.board.rows; y++) {
            const earth = player.board.earth[x][y];
            const air = player.board.air[x][y];
            if (earth && earth.id === id) return earth;
            if (air && air.id === id) return air;
        }
        return null;
    }
}
