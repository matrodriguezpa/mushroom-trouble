// Controlador de la partida: une el motor (core/) con las vistas (ui/views/).
// Aquí vive la lógica de interacción: qué pasa al hacer clic, arrastrar o soltar.

import { GameEngine } from '../core/GameEngine.js';
import { state } from './state.js';
import { log } from './logger.js';
import { getStack } from './stack.js';
import { renderBoard, highlightAttackers } from './views/boardView.js';
import { renderHand } from './views/handView.js';
import { updateHeader, renderKingdomInfo, showCardInfo, hideCardInfo } from './views/panelsView.js';
import { showStackModal, closeStackModal } from './views/stackModalView.js';

/* ================= Inicio y render ================= */

export function startGame({ cardsDb, playerCount, modeName, cols, rows }) {
    state.engine = new GameEngine({
        cardsDb, playerCount, modeName, cols, rows,
        hooks: {
            log,
            onTurnChange: render,
            confirmDefense: (defender, target) => confirm(`¿Usar a ${defender.name} para defender a ${target.name}?`),
        },
    });
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-view').classList.add('active');
    updateHeader(state.engine);
    render();
    log(`¡Comienza la Batalla de Reinos! Modo: ${modeName} · Grid ${cols}×${rows}`);
}

export function render() {
    const engine = state.engine;
    const current = engine.getCurrentPlayer();
    document.getElementById('boards-wrapper').classList.toggle('p2-turn', current.id === 1);
    document.getElementById('player1-board').innerHTML = renderBoard(engine.players[0]);
    document.getElementById('player2-board').innerHTML = renderBoard(engine.players[1]);
    renderHand(current, { onSelect: selectCardFromHand, onDragStart: dragStart, onDragEnd: dragEnd });
    renderKingdomInfo(engine);
    highlightAttackers(engine, current, state);
    updateHeader(engine);
}

/* ================= Eventos del tablero (delegación) =================
   Las celdas se re-dibujan con innerHTML en cada render, así que en vez de handlers
   inline se registra un único listener por evento sobre #boards-wrapper. */

export function initBoardEvents() {
    const wrapper = document.getElementById('boards-wrapper');
    const coords = (cell) => [Number(cell.dataset.player), Number(cell.dataset.x), Number(cell.dataset.y)];

    wrapper.addEventListener('dragover', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('drag-over');
    });
    wrapper.addEventListener('dragleave', (e) => {
        const cell = e.target.closest('.cell');
        if (cell) cell.classList.remove('drag-over');
    });
    wrapper.addEventListener('drop', (e) => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        e.preventDefault();
        cell.classList.remove('drag-over');
        drop(...coords(cell));
    });
    wrapper.addEventListener('click', (e) => {
        const cell = e.target.closest('.cell');
        if (cell) cellClicked(...coords(cell));
    });
    wrapper.addEventListener('mouseover', (e) => {
        const cardEl = e.target.closest('.card-wrapper');
        if (!cardEl) return;
        const cell = cardEl.closest('.cell');
        const { layer, bonus, cardId } = cardEl.dataset;
        showCardInfo(state.engine, cell.dataset.player, layer, Number(cell.dataset.x), Number(cell.dataset.y), bonus === 'true' ? cardId : null);
    });
    wrapper.addEventListener('mouseout', (e) => {
        if (e.target.closest('.card-wrapper')) hideCardInfo();
    });
}

/* ================= Drag & drop desde la mano ================= */

function dragStart(event, index) {
    state.dragIndex = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', 'hand-' + index);
    event.currentTarget.classList.add('dragging');
}

function dragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    state.dragIndex = null;
    document.querySelectorAll('.cell.drag-over').forEach(c => c.classList.remove('drag-over'));
}

function drop(playerId, x, y) {
    const idx = state.dragIndex;
    state.dragIndex = null;
    if (idx === null || idx === undefined) return;
    const current = state.engine.getCurrentPlayer();
    if (playerId !== current.id) { log("Solo puedes colocar cartas en tu propio reino."); return; }
    const card = current.hand[idx];
    if (!card) return;
    if (card.type === 'Bonus') {
        const targets = getStack(current, x, y).filter(s => !s.isBonus);
        if (targets.length === 0) { log("No hay cartas en esa posición para equipar la Bonus."); return; }
        if (targets.length === 1) { state.engine.playCard(current.id, idx, x, y, targets[0].card.id); render(); return; }
        openBonusTargetModal(current.id, idx, x, y, targets); return;
    }
    state.engine.playCard(current.id, idx, x, y);
    render();
}

/* ================= Clics ================= */

function cellClicked(playerId, x, y) {
    closeStackModal();
    const engine = state.engine;
    const player = engine.getPlayer(playerId);
    const earth = player.board.earth[x][y];
    const air = player.board.air[x][y];
    const total = (earth ? 1 + earth.attachedCards.length : 0) + (air ? 1 + air.attachedCards.length : 0);
    if (total > 1) { openStackModal(playerId, x, y); return; }
    const single = earth || air;
    if (single) { handleCardClick(playerId, x, y, single); return; }
    const current = engine.getCurrentPlayer();
    if (player.id === current.id && state.selectedCard && !state.pendingBonus) {
        engine.playCard(current.id, state.selectedCardIndex, x, y);
        state.selectedCard = null; state.selectedCardIndex = null;
        render();
    }
}

function handleCardClick(playerId, x, y, card) {
    const engine = state.engine;
    const player = engine.getPlayer(playerId);
    const current = engine.getCurrentPlayer();
    const enemy = engine.getEnemies(current)[0];
    if (player.id === current.id && state.pendingBonus && card) {
        engine.playCard(current.id, state.selectedCardIndex, x, y, card.id);
        state.pendingBonus = false; state.selectedCard = null; state.selectedCardIndex = null;
        render(); return;
    }
    if (player.id === enemy.id && state.pendingAttack && card) {
        engine.attack(state.selectedCardId, card.id);
        state.pendingAttack = false; state.selectedCardId = null;
        render(); return;
    }
    if (player.id === current.id && !state.selectedCard && !state.pendingBonus && card) {
        if (current.board.getHeads().includes(card)) {
            state.pendingAttack = true; state.selectedCardId = card.id;
            log(`Selecciona objetivo para ${card.name}.`); render();
        } else log("Esta carta no es cabeza de su columna; no puede atacar.");
    }
}

function selectCardFromHand(card, index) {
    state.selectedCard = card; state.selectedCardIndex = index; state.selectedCardId = null;
    if (card.type === 'Bonus') { state.pendingBonus = true; log("Selecciona una tropa aliada para equipar la Bonus."); }
    else if (card.location === 'none') { log(`${card.name} no puede colocarse directamente.`); state.selectedCard = null; }
    else log(`Arrastra o haz clic en una casilla de ${card.location === 'air' ? 'AIRE' : 'TIERRA'} para ${card.name}.`);
}

/* ================= Modales de selección ================= */

function openStackModal(playerId, x, y) {
    const items = getStack(state.engine.getPlayer(playerId), x, y);
    if (items.length === 0) return;
    showStackModal({
        header: 'Selecciona una carta',
        items, playerId, x, y,
        onPick: (item) => {
            if (item.isBonus) { showCardInfo(state.engine, playerId, item.layer, x, y, item.card.id); return; }
            handleCardClick(playerId, x, y, item.card);
        },
    });
}

function openBonusTargetModal(playerIndex, cardIndex, x, y, targets) {
    showStackModal({
        header: 'Selecciona la carta a equipar',
        items: targets, playerId: playerIndex, x, y,
        onPick: (item) => {
            state.engine.playCard(playerIndex, cardIndex, x, y, item.card.id);
            render();
        },
    });
}
