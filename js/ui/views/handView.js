// Dibuja la mano del jugador. Los callbacks los provee el controlador:
//   onSelect(card, index) · onDragStart(event, index) · onDragEnd(event)
export function renderHand(player, { onSelect, onDragStart, onDragEnd }) {
    const handArea = document.getElementById('hand-area');
    handArea.innerHTML = '';
    player.hand.forEach((card, i) => {
        const el = document.createElement('div');
        el.className = 'hand-card';
        el.draggable = true;
        el.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-stat">${card.type} · ${card.location === 'air' ? 'Aire' : (card.location === 'earth' ? 'Tierra' : '-')}</div>
        <div class="card-stat">ATQ: ${card.attack.damage || '-'}</div>
        <div class="card-stat">DEF: ${card.defense.value || '-'}</div>
        <div class="card-stat">HP: ${card.currentHealth}</div>`;
        el.ondragstart = (ev) => onDragStart(ev, i);
        el.ondragend = (ev) => onDragEnd(ev);
        el.onclick = () => onSelect(card, i);
        handArea.appendChild(el);
    });
}
