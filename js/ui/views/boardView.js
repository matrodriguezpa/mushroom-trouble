import { getStack } from '../stack.js';

export function renderBoard(player) {
    const cols = player.board.cols;
    const rows = player.board.rows;
    const cellW = 60, cellH = 70, gap = 25;
    const gridWidth = cols * cellW + (cols - 1) * gap;
    const gridHeight = rows * cellH + (rows - 1) * gap;

    let html = `<h2>${player.name}</h2>`;
    html += `<div class="board-wrapper" style="height: ${gridHeight}px; width: ${gridWidth}px;">`;
    html += `<div class="grid" style="grid-template-columns: repeat(${cols}, ${cellW}px); grid-template-rows: repeat(${rows}, ${cellH}px);">`;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) html += renderCell(player, x, y);
    html += `</div></div>`;
    return html;
}

// Las celdas no llevan handlers inline: los eventos se manejan por delegación en gameController.js
// usando los data-* (data-player, data-x, data-y, data-layer, data-bonus, data-card-id).
function renderCell(player, x, y) {
    const stack = getStack(player, x, y);

    let html = `<div class="cell" id="cell-${player.id}-${x}-${y}" data-player="${player.id}" data-x="${x}" data-y="${y}">`;
    html += `<div class="card-stack">`;
    stack.forEach((item, i) => {
        const offX = i * 8;
        const offY = i * 4;
        const typeClass = item.isBonus ? 'bonus' : (item.layer === 'air' ? 'aire' : 'tierra');
        html += `<div class="card-wrapper" data-layer="${item.layer}" data-bonus="${item.isBonus}" data-card-id="${item.card.id}"
        style="transform: translate(${offX}px, -${offY}px); z-index: ${i + 1};">`;
        html += `<div class="card ${typeClass}"><div>${item.card.name}</div><div>HP:${item.card.currentHealth}</div></div>`;
        html += `</div>`;
    });
    html += `</div></div>`;
    return html;
}

// Resalta con clases CSS las cartas que pueden atacar y, si hay un ataque pendiente, los objetivos válidos.
export function highlightAttackers(engine, player, { pendingAttack, selectedCardId }) {
    player.board.getHeads().forEach(card => {
        const cell = document.getElementById(`cell-${player.id}-${card.position.x}-${card.position.y}`);
        if (cell) cell.querySelectorAll('.card-wrapper').forEach(w => {
            if (w.dataset.bonus === 'false') {
                const inner = w.querySelector('.card');
                if (inner && inner.textContent.includes(card.name)) inner.classList.add('attacker');
            }
        });
    });
    if (pendingAttack) {
        const enemy = engine.getEnemies(player)[0];
        const attacker = engine.findCardById(player, selectedCardId);
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
