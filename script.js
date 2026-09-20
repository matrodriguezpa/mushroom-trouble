function log(msg) {
    const engine = UI.engine;
    const logs = document.getElementById('logs');
    if (!logs) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const turnInfo = engine ? `[${engine.getCurrentPlayer().name}]` : '[Sistema]';
    entry.textContent = `${turnInfo} ${msg}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
}

const CARDS_DB = [
    { "id": "rey_1", "name": "Rey", "type": "Rey", "location": "earth", "attack": { "type": "none", "damage": 0 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 3 } },
    { "id": "soldado_1", "name": "Soldado", "type": "Tropa", "location": "earth", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "self", "value": 1 }, "health": { "type": "lives", "value": 2 } },
    { "id": "arquero_1", "name": "Arquero", "type": "Tropa", "location": "earth", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 1 } },
    { "id": "caballero_1", "name": "Caballero", "type": "Tropa", "location": "earth", "attack": { "type": "2", "damage": 2 }, "defense": { "type": "self", "value": 1 }, "health": { "type": "lives", "value": 2 } },
    { "id": "halcon_1", "name": "Halcón", "type": "Tropa", "location": "air", "attack": { "type": "1", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "lives", "value": 1 } },
    { "id": "dragon_1", "name": "Dragón", "type": "Tropa", "location": "air", "attack": { "type": "2", "damage": 3 }, "defense": { "type": "self", "value": 1 }, "health": { "type": "lives", "value": 3 } },
    { "id": "bonus_espada", "name": "Espada +1", "type": "Bonus", "location": "none", "attack": { "type": "auto", "damage": 1 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "turns", "value": 2 } },
    { "id": "especial_rayo", "name": "Rayo", "type": "Especial", "location": "none", "attack": { "type": "1", "damage": 3 }, "defense": { "type": "none", "value": 0 }, "health": { "type": "attacks", "value": 1 } },
    { "id": "soporte_escudo", "name": "Escudero", "type": "Soporte", "location": "earth", "attack": { "type": "none", "damage": 0 }, "defense": { "type": "others", "value": 2 }, "health": { "type": "turns", "value": 3 } }
];

class Card {
    constructor(config) {
        Object.assign(this, config);
        this.id = config.id + '_' + Math.random().toString(36).substring(2, 8);
        this.currentHealth = config.health.value;
        this.position = { x: null, y: null, layer: null };
        this.attachedCards = [];
    }
}

class Board {
    constructor(playerId, cols = 3, rows = 3) {
        this.playerId = playerId;
        this.cols = cols;
        this.rows = rows;
        this.earth = Array(cols).fill(null).map(() => Array(rows).fill(null));
        this.air = Array(cols).fill(null).map(() => Array(rows).fill(null));
        this.maxCards = 8;
    }
    getBackRow() { return this.rows - 1; }

    getHeads() {
        const heads = [];
        for (let x = 0; x < this.cols; x++) {
            for (const layer of ['earth', 'air']) {
                const grid = this[layer];
                for (let y = 0; y < this.rows; y++) {
                    if (grid[x][y]) { heads.push(grid[x][y]); break; }
                }
            }
        }
        return heads;
    }
    isBackRowProtected(layer) {
        const grid = this[layer];
        const backRow = this.getBackRow();
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < backRow; y++) {
                if (grid[x][y]) return true;
            }
        }
        return false;
    }
    canBeAttacked(target, attacker) {
        const layer = target.position.layer;
        const { x: tx, y: ty } = target.position;
        const ax = attacker.position.x;
        const grid = this[layer];
        const backRow = this.getBackRow();

        if (ty === backRow && this.isBackRowProtected(layer)) return false;
        if (attacker.position.layer === 'air') return true;
        if (ty > 0 && grid[tx][ty - 1] && ax !== tx) return false;
        if (ty > 0 && tx > 0 && grid[tx - 1][ty - 1] && ax <= tx - 1) return false;
        if (ty > 0 && tx < this.cols - 1 && grid[tx + 1][ty - 1] && ax >= tx + 1) return false;
        return true;
    }
}

class Player {
    constructor(id, name, cols = 3, rows = 3) {
        this.id = id; this.name = name;
        this.board = new Board(id, cols, rows);
        this.hand = []; this.maxHandSize = 5;
    }
}

class GameEngine {
    constructor(playerCount = 2, modeName = 'Free For All', cols = 3, rows = 3) {
        this.players = []; this.turn = 0; this.state = 'PLAYING';
        this.modeName = modeName; this.turnCount = 1;
        this.cols = cols; this.rows = rows;
        const centerCol = Math.floor(cols / 2);
        const backRow = rows - 1;
        for (let i = 0; i < playerCount; i++) {
            const p = new Player(i, `Jugador ${i + 1}`, cols, rows);
            const reyConfig = CARDS_DB.find(c => c.type === 'Rey');
            const rey = new Card(reyConfig);
            p.board.earth[centerCol][backRow] = rey;
            rey.position = { x: centerCol, y: backRow, layer: 'earth' };
            this.players.push(p);
            for (let j = 0; j < 5; j++) {
                const randomCard = CARDS_DB[Math.floor(Math.random() * CARDS_DB.length)];
                p.hand.push(new Card(randomCard));
            }
        }
    }
    getCurrentPlayer() { return this.players[this.turn]; }
    getEnemies(player) { return this.players.filter(p => p.id !== player.id); }

    playCard(playerIndex, cardIndex, x, y, targetCardId = null) {
        const player = this.players[playerIndex];
        const card = player.hand[cardIndex];
        if (!card) return false;
        const isAir = card.location === 'air';
        if (card.type === 'Bonus') {
            if (!targetCardId) { log("Selecciona una tropa para equipar la Bonus."); return false; }
            const target = this.findCardById(player, targetCardId);
            if (!target) { log("Tropa no encontrada."); return false; }
            target.attachedCards.push(card);
            player.hand.splice(cardIndex, 1);
            log(`${player.name} equipó ${card.name} a ${target.name}.`);
            this.nextTurn(); return true;
        }
        if (card.location === 'none') { log(`${card.name} es Especial; no puede colocarse.`); return false; }
        if (x < 0 || x >= player.board.cols || y < 0 || y >= player.board.rows) { log("Posición fuera del tablero."); return false; }
        const layer = isAir ? player.board.air : player.board.earth;
        if (layer[x][y]) { log(`Casilla ocupada en ${isAir ? 'aire' : 'tierra'}.`); return false; }
        const backRow = player.board.getBackRow();
        if (!isAir && y !== backRow) {
            if (!this.hasAdjacent(player.board.earth, x, y)) {
                log(`Solo la fila inferior (y=${backRow}) permite colocación libre. En otras filas necesitas una carta adyacente.`);
                return false;
            }
        }
        let count = 0;
        layer.forEach(col => col.forEach(c => { if (c) count++; }));
        if (count >= player.board.maxCards) { log("Límite de 8 cartas alcanzado."); return false; }
        layer[x][y] = card;
        card.position = { x, y, layer: isAir ? 'air' : 'earth' };
        player.hand.splice(cardIndex, 1);
        log(`${player.name} colocó ${card.name} en ${isAir ? 'Aire' : 'Tierra'} (${x},${y}).`);
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
        if (!attacker || !target) { log("Carta no encontrada."); return; }
        if (!this.isHeadOfColumn(player, attacker)) { log("Solo la primera carta de cada columna puede atacar."); return; }
        if (attacker.position.layer === 'earth' && target.position.layer === 'air') { log("Las cartas terrestres no pueden atacar a las aéreas."); return; }
        if (!enemy.board.canBeAttacked(target, attacker)) { log(`${target.name} no es atacable.`); return; }
        let damage = attacker.attack.damage;
        attacker.attachedCards.forEach(bonus => { if (bonus.attack.type === 'auto') damage += bonus.attack.damage; });
        let defenderCard = target;
        const defendingAlly = this.findDefenders(enemy, target);
        if (defendingAlly) {
            if (confirm(`¿Usar a ${defendingAlly.name} para defender a ${target.name}?`)) defenderCard = defendingAlly;
        }
        const isDiagonal = attacker.position.x !== target.position.x;
        log(`${player.name} ataca ${isDiagonal ? 'DIAGONALMENTE ' : ''}con ${attacker.name} (${damage} dmg) a ${defenderCard.name}.`);
        if (defenderCard.defense.type === 'self' && attacker.position.layer !== 'air') {
            log(`${defenderCard.name} contraataca con ${defenderCard.defense.value} dmg.`);
            attacker.currentHealth -= defenderCard.defense.value;
            if (attacker.currentHealth <= 0) { log(`${attacker.name} ha caído.`); this.removeCard(player, attacker); }
        }
        defenderCard.currentHealth -= damage;
        if (defenderCard.currentHealth <= 0) {
            log(`${defenderCard.name} ha sido eliminada.`);
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
            const randomCard = new Card(CARDS_DB[Math.floor(Math.random() * CARDS_DB.length)]);
            if (player.hand.length >= player.maxHandSize) {
                const enemy = this.getEnemies(player)[0];
                log(`Mano llena: ${enemy.name} recibe la bonificación.`);
                enemy.hand.push(randomCard);
            } else player.hand.push(randomCard);
        }
    }
    checkDespairDraw(player) {
        if (player.hand.length === 0 && player.board.getHeads().length === 0) {
            log(`${player.name} entra en desesperación: roba 3 cartas.`);
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
                log(`¡${player.name} perdió su Rey! ¡${winner.name} GANA!`);
                this.state = 'OVER'; return;
            }
        }
    }
    nextTurn() {
        this.turnCount++;
        this.turn = (this.turn + 1) % this.players.length;
        this.checkDespairDraw(this.getCurrentPlayer());
        UI.render();
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

const UI = {
    engine: null, selectedCard: null, selectedCardIndex: null,
    selectedCardId: null, pendingBonus: false, pendingAttack: false,
    selectedPlayerCount: 2, selectedMode: null, selectedGrid: '3x3',
    dragIndex: null,
    modeLabels: { ffa: 'Free For All', race: 'Race', rush: 'Rush', '2v2': '2 vs 2', tournament: 'Tournament' },
    gridLabels: { '3x3': 'Grid 3×3', '5x3': 'Grid 5×3' },

    init(playerCount, modeName, cols, rows) {
        this.engine = new GameEngine(playerCount, modeName, cols, rows);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-view').classList.add('active');
        this.updateHeader();
        this.render();
        log(`¡Comienza la Batalla de Reinos! Modo: ${modeName} · Grid ${cols}×${rows}`);
    },

    updateHeader() {
        if (!this.engine) return;
        document.getElementById('hud-mode').textContent = this.engine.modeName;
        document.getElementById('hud-grid').textContent = `${this.engine.cols}×${this.engine.rows}`;
        document.getElementById('hud-players').textContent = this.engine.players.length;
        document.getElementById('hud-turn').textContent = this.engine.turnCount;
    },

    updateModeSummary() {
        const parts = [];
        if (this.selectedMode) parts.push(this.modeLabels[this.selectedMode]);
        if (this.selectedGrid) parts.push(this.gridLabels[this.selectedGrid]);
        const summary = document.getElementById('mode-summary');
        summary.textContent = parts.length > 0 ? parts.join(' · ') : 'Modo de Juego';
        summary.classList.toggle('has-selection', parts.length > 0);
    },

    dragStart(event, index) {
        this.dragIndex = index;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', 'hand-' + index);
        event.currentTarget.classList.add('dragging');
    },
    dragEnd(event) {
        event.currentTarget.classList.remove('dragging');
        this.dragIndex = null;
        document.querySelectorAll('.cell.drag-over').forEach(c => c.classList.remove('drag-over'));
    },
    dragOver(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; event.currentTarget.classList.add('drag-over'); },
    dragLeave(event) { event.currentTarget.classList.remove('drag-over'); },

    drop(event, playerId, x, y) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const idx = this.dragIndex;
        this.dragIndex = null;
        if (idx === null || idx === undefined) return;
        const current = this.engine.getCurrentPlayer();
        if (playerId !== current.id) { log("Solo puedes colocar cartas en tu propio reino."); return; }
        const card = current.hand[idx];
        if (!card) return;
        if (card.type === 'Bonus') {
            const targets = this.getStackCards(playerId, x, y).filter(s => !s.isBonus);
            if (targets.length === 0) { log("No hay cartas en esa posición para equipar la Bonus."); return; }
            if (targets.length === 1) { this.engine.playCard(current.id, idx, x, y, targets[0].card.id); this.render(); return; }
            this.openBonusTargetModal(current.id, idx, x, y, targets); return;
        }
        this.engine.playCard(current.id, idx, x, y);
        this.render();
    },

    getStackCards(playerId, x, y) {
        const player = this.engine.players.find(p => p.id == playerId);
        const stack = [];
        const earth = player.board.earth[x][y];
        const air = player.board.air[x][y];
        if (earth) { stack.push({ card: earth, layer: 'earth', isBonus: false }); earth.attachedCards.forEach(b => stack.push({ card: b, layer: 'earth', isBonus: true })); }
        if (air) { stack.push({ card: air, layer: 'air', isBonus: false }); air.attachedCards.forEach(b => stack.push({ card: b, layer: 'air', isBonus: true })); }
        return stack;
    },
    openStackModal(playerId, x, y) {
        const cards = this.getStackCards(playerId, x, y);
        if (cards.length === 0) return;
        const container = document.getElementById('stack-modal-cards');
        const modal = document.getElementById('stack-modal');
        modal.querySelector('.stack-modal-header').textContent = 'Selecciona una carta';
        container.innerHTML = '';
        cards.forEach(item => {
            const el = document.createElement('div');
            const layerClass = item.layer === 'air' ? 'aire' : (item.isBonus ? 'bonus' : '');
            el.className = 'modal-card ' + layerClass;
            el.innerHTML = `<div class="mc-name">${item.card.name}</div><div>${item.card.type}</div><div>HP: ${item.card.currentHealth}</div><span class="mc-layer">${item.layer === 'air' ? 'AIRE' : 'TIERRA'}${item.isBonus ? ' · BONUS' : ''}</span>`;
            el.onclick = (ev) => {
                ev.stopPropagation();
                this.closeStackModal();
                if (item.isBonus) { this.showCardInfo(playerId, item.layer, x, y, item.card.id); return; }
                this.handleCardClick(playerId, x, y, item.card);
            };
            container.appendChild(el);
        });
        this.positionModal(modal, playerId, x, y);
    },
    openBonusTargetModal(playerIndex, cardIndex, x, y, targets) {
        const container = document.getElementById('stack-modal-cards');
        const modal = document.getElementById('stack-modal');
        modal.querySelector('.stack-modal-header').textContent = 'Selecciona la carta a equipar';
        container.innerHTML = '';
        targets.forEach(item => {
            const el = document.createElement('div');
            el.className = 'modal-card ' + (item.layer === 'air' ? 'aire' : '');
            el.innerHTML = `<div class="mc-name">${item.card.name}</div><div>${item.card.type}</div><div>HP: ${item.card.currentHealth}</div><span class="mc-layer">${item.layer === 'air' ? 'AIRE' : 'TIERRA'}</span>`;
            el.onclick = (ev) => {
                ev.stopPropagation();
                this.closeStackModal();
                this.engine.playCard(playerIndex, cardIndex, x, y, item.card.id);
                this.render();
            };
            container.appendChild(el);
        });
        this.positionModal(modal, playerIndex, x, y);
    },
    positionModal(modal, playerId, x, y) {
        const cell = document.getElementById(`cell-${playerId}-${x}-${y}`);
        modal.classList.remove('hidden');
        modal.style.transform = 'none';
        if (cell) {
            const rect = cell.getBoundingClientRect();
            const mr = modal.getBoundingClientRect();
            let top = rect.top - mr.height - 30;
            let left = rect.left + rect.width / 2 - mr.width / 2;
            if (top < 10) top = rect.bottom + 30;
            if (left < 10) left = 10;
            if (left + mr.width > window.innerWidth - 10) left = window.innerWidth - mr.width - 10;
            if (top + mr.height > window.innerHeight - 10) top = window.innerHeight - mr.height - 10;
            modal.style.top = top + 'px';
            modal.style.left = left + 'px';
        } else {
            modal.style.top = '50%'; modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
        }
    },
    closeStackModal() { document.getElementById('stack-modal').classList.add('hidden'); },

    render() {
        const current = this.engine.getCurrentPlayer();
        document.getElementById('boards-wrapper').classList.toggle('p2-turn', current.id === 1);
        document.getElementById('player1-board').innerHTML = this.renderBoard(this.engine.players[0]);
        document.getElementById('player2-board').innerHTML = this.renderBoard(this.engine.players[1]);

        const handArea = document.getElementById('hand-area');
        handArea.innerHTML = '';
        current.hand.forEach((card, i) => {
            const el = document.createElement('div');
            el.className = 'hand-card';
            el.draggable = true;
            el.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-stat">${card.type} · ${card.location === 'air' ? 'Aire' : (card.location === 'earth' ? 'Tierra' : '-')}</div>
        <div class="card-stat">ATQ: ${card.attack.damage || '-'}</div>
        <div class="card-stat">DEF: ${card.defense.value || '-'}</div>
        <div class="card-stat">HP: ${card.currentHealth}</div>`;
            el.ondragstart = (ev) => this.dragStart(ev, i);
            el.ondragend = (ev) => this.dragEnd(ev);
            el.onclick = () => this.selectCardFromHand(card, i);
            handArea.appendChild(el);
        });
        this.renderKingdomInfo();
        this.highlightAttackers(current);
        this.updateHeader();
    },

    renderKingdomInfo() {
        let html = '';
        this.engine.players.forEach(p => {
            let kingHP = 0;
            for (let x = 0; x < p.board.cols; x++) for (let y = 0; y < p.board.rows; y++) {
                const c = p.board.earth[x][y];
                if (c && c.type === 'Rey') kingHP = c.currentHealth;
            }
            let cardCount = 0;
            ['earth', 'air'].forEach(layer => p.board[layer].forEach(col => col.forEach(c => { if (c) cardCount++; })));
            const isCurrent = p.id === this.engine.getCurrentPlayer().id;
            html += `<div class="kingdom-info ${isCurrent ? 'active-turn' : ''}">
        <div class="kingdom-name">${p.name}</div>
        <div class="kingdom-stats">
          <span title="Vida del Rey">👑 ${kingHP}</span>
          <span title="Cartas en tablero">🃏 ${cardCount}</span>
          <span title="Cartas en mano">✋ ${p.hand.length}</span>
        </div>
      </div>`;
        });
        document.getElementById('kingdom-info').innerHTML = html;
    },

    renderBoard(player) {
        const cols = player.board.cols;
        const rows = player.board.rows;
        const cellW = 60, cellH = 70, gap = 25;
        const gridWidth = cols * cellW + (cols - 1) * gap;
        const gridHeight = rows * cellH + (rows - 1) * gap;

        let html = `<h2>${player.name}</h2>`;
        html += `<div class="board-wrapper" style="height: ${gridHeight}px; width: ${gridWidth}px;">`;
        html += `<div class="grid" style="grid-template-columns: repeat(${cols}, ${cellW}px); grid-template-rows: repeat(${rows}, ${cellH}px);">`;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) html += this.renderCell(player, x, y);
        html += `</div></div>`;
        return html;
    },

    renderCell(player, x, y) {
        const earth = player.board.earth[x][y];
        const air = player.board.air[x][y];
        const stack = [];
        if (earth) { stack.push({ card: earth, layer: 'earth', isBonus: false }); earth.attachedCards.forEach(b => stack.push({ card: b, layer: 'earth', isBonus: true })); }
        if (air) { stack.push({ card: air, layer: 'air', isBonus: false }); air.attachedCards.forEach(b => stack.push({ card: b, layer: 'air', isBonus: true })); }

        let html = `<div class="cell" id="cell-${player.id}-${x}-${y}"
      ondragover="UI.dragOver(event)" ondragleave="UI.dragLeave(event)"
      ondrop="UI.drop(event, ${player.id}, ${x}, ${y})"
      onclick="UI.cellClicked(${player.id}, ${x}, ${y})">`;
        html += `<div class="card-stack">`;
        stack.forEach((item, i) => {
            const offX = i * 8;
            const offY = i * 4;
            const typeClass = item.isBonus ? 'bonus' : (item.layer === 'air' ? 'aire' : 'tierra');
            html += `<div class="card-wrapper" data-layer="${item.layer}" data-bonus="${item.isBonus}"
        style="transform: translate(${offX}px, -${offY}px); z-index: ${i + 1};"
        onmouseenter="UI.showCardInfo('${player.id}', '${item.layer}', ${x}, ${y}, ${item.isBonus ? `'${item.card.id}'` : 'null'})"
        onmouseleave="UI.hideCardInfo()">`;
            html += `<div class="card ${typeClass}"><div>${item.card.name}</div><div>HP:${item.card.currentHealth}</div></div>`;
            html += `</div>`;
        });
        html += `</div></div>`;
        return html;
    },

    showCardInfo(playerId, layer, x, y, cardId = null) {
        const player = this.engine.players.find(p => p.id == playerId);
        let card = player.board[layer][x][y];
        let isBonus = false;
        if (cardId && card && card.attachedCards) {
            const bonus = card.attachedCards.find(b => b.id === cardId);
            if (bonus) { card = bonus; isBonus = true; }
        }
        if (!card) return;
        document.getElementById('card-info-content').innerHTML = `
      <h4>${card.name}${isBonus ? ' <small style="color:#ffb300">(Bonus)</small>' : ''}</h4>
      <div class="info-row"><strong>Tipo</strong><span>${card.type}</span></div>
      <div class="info-row"><strong>Capa</strong><span>${layer === 'air' ? 'Aire' : 'Tierra'}</span></div>
      <div class="info-row"><strong>Posición</strong><span>(${x}, ${y})</span></div>
      <div class="info-row"><strong>Ataque</strong><span>${card.attack.type === 'none' ? '—' : card.attack.damage + (card.attack.type === 'auto' ? ' (auto)' : '')}</span></div>
      <div class="info-row"><strong>Defensa</strong><span>${card.defense.type === 'none' ? '—' : card.defense.value + ' (' + card.defense.type + ')'}</span></div>
      <div class="info-row"><strong>Vida</strong><span>${card.currentHealth} / ${card.health.value}</span></div>
      <div class="info-row"><strong>Tipo Vida</strong><span>${card.health.type}</span></div>
      ${!isBonus && card.attachedCards.length > 0 ? `<div class="info-row"><strong>Bonus</strong><span>${card.attachedCards.map(b => b.name).join(', ')}</span></div>` : ''}
    `;
    },
    hideCardInfo() {
        document.getElementById('card-info-content').innerHTML = '<div class="hint">Pasa el cursor sobre una carta del tablero para ver su información</div>';
    },

    cellClicked(playerId, x, y) {
        this.closeStackModal();
        const player = this.engine.players.find(p => p.id == playerId);
        const earth = player.board.earth[x][y];
        const air = player.board.air[x][y];
        const total = (earth ? 1 + earth.attachedCards.length : 0) + (air ? 1 + air.attachedCards.length : 0);
        if (total > 1) { this.openStackModal(playerId, x, y); return; }
        const single = earth || air;
        if (single) { this.handleCardClick(playerId, x, y, single); return; }
        const current = this.engine.getCurrentPlayer();
        if (player.id === current.id && this.selectedCard && !this.pendingBonus) {
            this.engine.playCard(current.id, this.selectedCardIndex, x, y);
            this.selectedCard = null; this.selectedCardIndex = null;
            this.render();
        }
    },

    handleCardClick(playerId, x, y, card) {
        const player = this.engine.players.find(p => p.id == playerId);
        const current = this.engine.getCurrentPlayer();
        const enemy = this.engine.getEnemies(current)[0];
        if (player.id === current.id && this.pendingBonus && card) {
            this.engine.playCard(current.id, this.selectedCardIndex, x, y, card.id);
            this.pendingBonus = false; this.selectedCard = null; this.selectedCardIndex = null;
            this.render(); return;
        }
        if (player.id === enemy.id && this.pendingAttack && card) {
            this.engine.attack(this.selectedCardId, card.id);
            this.pendingAttack = false; this.selectedCardId = null;
            this.render(); return;
        }
        if (player.id === current.id && !this.selectedCard && !this.pendingBonus && card) {
            if (current.board.getHeads().includes(card)) {
                this.pendingAttack = true; this.selectedCardId = card.id;
                log(`Selecciona objetivo para ${card.name}.`); this.render();
            } else log("Esta carta no es cabeza de su columna; no puede atacar.");
        }
    },

    selectCardFromHand(card, index) {
        this.selectedCard = card; this.selectedCardIndex = index; this.selectedCardId = null;
        if (card.type === 'Bonus') { this.pendingBonus = true; log("Selecciona una tropa aliada para equipar la Bonus."); }
        else if (card.location === 'none') { log(`${card.name} no puede colocarse directamente.`); this.selectedCard = null; }
        else log(`Arrastra o haz clic en una casilla de ${card.location === 'air' ? 'AIRE' : 'TIERRA'} para ${card.name}.`);
    },

    highlightAttackers(player) {
        player.board.getHeads().forEach(card => {
            const cell = document.getElementById(`cell-${player.id}-${card.position.x}-${card.position.y}`);
            if (cell) cell.querySelectorAll('.card-wrapper').forEach(w => {
                if (w.dataset.bonus === 'false') {
                    const inner = w.querySelector('.card');
                    if (inner && inner.textContent.includes(card.name)) inner.classList.add('attacker');
                }
            });
        });
        if (this.pendingAttack) {
            const enemy = this.engine.getEnemies(player)[0];
            const attacker = this.engine.findCardById(player, this.selectedCardId);
            if (!attacker) return;
            ['earth', 'air'].forEach(layer => {
                enemy.board[layer].forEach((col, x) => col.forEach((cellCard, y) => {
                    if (!cellCard) return;
                    if (attacker.position.layer === 'earth' && cellCard.position.layer === 'air') return;
                    if (enemy.board.canBeAttacked(cellCard, attacker)) {
                        const cellEl = document.getElementById(`cell-${enemy.id}-${x}-${y}`);
                        if (cellEl) cellEl.querySelectorAll('.card-wrapper').forEach(w => {
                            if (w.dataset.bonus === 'false' && w.dataset.layer === cellCard.position.layer) {
                                const inner = w.querySelector('.card');
                                if (inner && inner.textContent.includes(cellCard.name)) inner.classList.add('vulnerable');
                            }
                        });
                    }
                }));
            });
        }
    }
};

document.addEventListener('click', (e) => {
    const modal = document.getElementById('stack-modal');
    if (!modal.classList.contains('hidden') && !modal.contains(e.target)) {
        if (!e.target.closest('.cell')) modal.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const playerSelector = document.getElementById('player-selector');
    const startBtn = document.getElementById('start-btn');

    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.onclick = () => {
            if (opt.classList.contains('locked')) return;
            if (opt.dataset.mode) {
                document.querySelectorAll('.mode-option[data-mode]').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                UI.selectedMode = opt.dataset.mode;
                playerSelector.classList.add('visible');
                startBtn.disabled = false;
            } else if (opt.dataset.grid) {
                document.querySelectorAll('.mode-option[data-grid]').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                UI.selectedGrid = opt.dataset.grid;
            }
            UI.updateModeSummary();
        };
    });

    document.querySelectorAll('#player-count-buttons button').forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;
            document.querySelectorAll('#player-count-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UI.selectedPlayerCount = parseInt(btn.dataset.count, 10);
        };
    });

    startBtn.onclick = () => {
        if (!UI.selectedMode) return;
        // Mapeo: 3x3 → cols=3, rows=3 | 5x3 → cols=5, rows=3
        const gridMap = { '3x3': { cols: 3, rows: 3 }, '5x3': { cols: 5, rows: 3 } };
        const { cols, rows } = gridMap[UI.selectedGrid];
        UI.init(UI.selectedPlayerCount, UI.modeLabels[UI.selectedMode], cols, rows);
    };

    document.querySelectorAll('#layer-controls button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#layer-controls button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.body.className = 'show-' + btn.dataset.layer;
        };
    });

    const toggleBtn = document.getElementById('toggle-hand-btn');
    const handArea = document.getElementById('hand-area');
    toggleBtn.onclick = () => {
        handArea.classList.toggle('minimized');
        toggleBtn.textContent = handArea.classList.contains('minimized') ? '▲' : '▼';
    };

    UI.updateModeSummary();
});