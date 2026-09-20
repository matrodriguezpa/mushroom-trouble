// Modal flotante para elegir una carta cuando en una celda hay varias apiladas.
// No conoce reglas del juego: recibe los items y avisa con onPick(item).

export function initStackModal() {
    // Cierra el modal al hacer clic fuera de él (salvo sobre una celda, que lo gestiona su propio clic).
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('stack-modal');
        if (!modal.classList.contains('hidden') && !modal.contains(e.target)) {
            if (!e.target.closest('.cell')) modal.classList.add('hidden');
        }
    });
}

export function showStackModal({ header, items, playerId, x, y, onPick }) {
    const container = document.getElementById('stack-modal-cards');
    const modal = document.getElementById('stack-modal');
    modal.querySelector('.stack-modal-header').textContent = header;
    container.innerHTML = '';
    items.forEach(item => {
        const el = document.createElement('div');
        const layerClass = item.layer === 'air' ? 'aire' : (item.isBonus ? 'bonus' : '');
        el.className = 'modal-card ' + layerClass;
        el.innerHTML = `<div class="mc-name">${item.card.name}</div><div>${item.card.type}</div><div>HP: ${item.card.currentHealth}</div><span class="mc-layer">${item.layer === 'air' ? 'AIRE' : 'TIERRA'}${item.isBonus ? ' · BONUS' : ''}</span>`;
        el.onclick = (ev) => {
            ev.stopPropagation();
            closeStackModal();
            onPick(item);
        };
        container.appendChild(el);
    });
    positionModal(modal, playerId, x, y);
}

export function closeStackModal() {
    document.getElementById('stack-modal').classList.add('hidden');
}

function positionModal(modal, playerId, x, y) {
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
}
