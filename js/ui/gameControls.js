// Controles de la vista de juego que no dependen de las reglas: filtro de capas y mano minimizable.

export function initGameControls() {
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
}
