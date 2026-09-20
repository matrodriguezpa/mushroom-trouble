// Pantalla de inicio: selección de modo, tamaño de grid y cantidad de jugadores.
// No arranca la partida por sí sola: al pulsar "Iniciar" llama a onStart(config).

import { MODE_LABELS, GRID_LABELS, GRID_SIZES } from '../config/constants.js';

const selection = { mode: null, grid: '3x3', playerCount: 2 };
let cardsReady = false;

function updateModeSummary() {
    const parts = [];
    if (selection.mode) parts.push(MODE_LABELS[selection.mode]);
    if (selection.grid) parts.push(GRID_LABELS[selection.grid]);
    const summary = document.getElementById('mode-summary');
    summary.textContent = parts.length > 0 ? parts.join(' · ') : 'Modo de Juego';
    summary.classList.toggle('has-selection', parts.length > 0);
}

// El botón solo se habilita con un modo elegido y las cartas ya cargadas.
function updateStartButton() {
    document.getElementById('start-btn').disabled = !(selection.mode && cardsReady);
}

export function setCardsReady(ready) {
    cardsReady = ready;
    updateStartButton();
}

export function showLoadError(message) {
    const el = document.getElementById('load-error');
    el.textContent = message;
    el.hidden = false;
}

export function initStartScreen({ onStart }) {
    const playerSelector = document.getElementById('player-selector');
    const startBtn = document.getElementById('start-btn');

    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.onclick = () => {
            if (opt.classList.contains('locked')) return;
            if (opt.dataset.mode) {
                document.querySelectorAll('.mode-option[data-mode]').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selection.mode = opt.dataset.mode;
                playerSelector.classList.add('visible');
                updateStartButton();
            } else if (opt.dataset.grid) {
                document.querySelectorAll('.mode-option[data-grid]').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selection.grid = opt.dataset.grid;
            }
            updateModeSummary();
        };
    });

    document.querySelectorAll('#player-count-buttons button').forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;
            document.querySelectorAll('#player-count-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selection.playerCount = parseInt(btn.dataset.count, 10);
        };
    });

    startBtn.onclick = () => {
        if (!selection.mode || !cardsReady) return;
        const { cols, rows } = GRID_SIZES[selection.grid];
        onStart({ playerCount: selection.playerCount, modeName: MODE_LABELS[selection.mode], cols, rows });
    };

    updateModeSummary();
}
