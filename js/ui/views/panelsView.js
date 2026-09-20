// Cabecera (HUD) y paneles laterales: lista de reinos y detalle de carta.

export function updateHeader(engine) {
    if (!engine) return;
    document.getElementById('hud-mode').textContent = engine.modeName;
    document.getElementById('hud-grid').textContent = `${engine.cols}×${engine.rows}`;
    document.getElementById('hud-players').textContent = engine.players.length;
    document.getElementById('hud-turn').textContent = engine.turnCount;
}

export function renderKingdomInfo(engine) {
    let html = '';
    engine.players.forEach(p => {
        let kingHP = 0;
        for (let x = 0; x < p.board.cols; x++) for (let y = 0; y < p.board.rows; y++) {
            const c = p.board.earth[x][y];
            if (c && c.type === 'Rey') kingHP = c.currentHealth;
        }
        let cardCount = 0;
        ['earth', 'air'].forEach(layer => p.board[layer].forEach(col => col.forEach(c => { if (c) cardCount++; })));
        const isCurrent = p.id === engine.getCurrentPlayer().id;
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
}

export function showCardInfo(engine, playerId, layer, x, y, cardId = null) {
    const player = engine.getPlayer(playerId);
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
}

export function hideCardInfo() {
    document.getElementById('card-info-content').innerHTML = '<div class="hint">Pasa el cursor sobre una carta del tablero para ver su información</div>';
}
