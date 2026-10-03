// Pantalla de inicio: menú principal (Cuenta, Mazos, Jugar, Créditos) con un panel que se expande.
// El panel "Jugar" contiene tipo de partida, opciones del modo y mazo.
// No arranca la partida por sí sola: al pulsar "Listo" llama a onStart(config).

import { MODES, OPTION_DEFS, GRID_SIZES } from '../config/constants.js';

const $ = (id) => document.getElementById(id);

// Valores actuales de todas las opciones; se conservan al cambiar de modo.
const values = Object.fromEntries(Object.entries(OPTION_DEFS).map(([key, def]) => [key, def.default]));
let currentMode = 'ffa';
let currentPanel = null;
let cardsReady = false;

/* ================= Menú y paneles ================= */

function openPanel(name) {
    currentPanel = name;
    $('start-screen').classList.add('panel-open');
    $('close-panel-btn').hidden = false;
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.querySelectorAll('.panel-content').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
}

// Al cerrar no se oculta el contenido, para que se vea mientras el panel se pliega.
function closePanel() {
    currentPanel = null;
    $('start-screen').classList.remove('panel-open');
    $('close-panel-btn').hidden = true;
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
}

/* ================= Tipo de partida y opciones ================= */

function renderModes() {
    $('mode-list').innerHTML = Object.entries(MODES).map(([id, m]) => `
        <div class="mode-item${m.locked ? ' locked' : ''}${id === currentMode ? ' selected' : ''}" data-mode="${id}">
            ${m.label}${m.locked ? ' <span class="lock-icon">🔒</span>' : ''}
        </div>`).join('');
    showDescription(currentMode);
}

// La descripción del modo seleccionado se muestra bajo la lista.
function showDescription(modeId) {
    $('mode-description').textContent = MODES[modeId].description;
}

function renderOptions() {
    $('mode-options').innerHTML = MODES[currentMode].options.map(key => {
        const def = OPTION_DEFS[key];
        const buttons = def.choices.map(c =>
            `<button class="opt-btn${values[key] === c.value ? ' active' : ''}" data-key="${key}" data-value="${c.value}"${c.disabled ? ' disabled' : ''}>${c.label}</button>`
        ).join('');
        return `<div class="option-row"><label>${def.label}</label><div class="option-buttons">${buttons}</div></div>`;
    }).join('');
}

/* ================= Mazo ================= */

// Los mazos aún no existen. Cuando se creen, llamar a renderDecks([{ id, name, thumb }]).
export function renderDecks(decks = []) {
    $('deck-list').innerHTML = decks.length === 0
        ? '<div class="deck-empty">Aún no tienes mazos. Aquí aparecerán los que crees, con su miniatura.</div>'
        : decks.map(d => `
            <div class="deck-item" data-deck="${d.id}">
                <div class="deck-thumb"${d.thumb ? ` style="background-image:url('${d.thumb}')"` : ''}></div>
                <span>${d.name}</span>
            </div>`).join('');
}

/* ================= Botón "Listo" ================= */

function updateStartButton() {
    const mode = MODES[currentMode];
    const ready = cardsReady && mode.playable;
    $('start-btn').disabled = !ready;
    $('ready-hint').textContent = !cardsReady ? 'Cargando cartas…' : !mode.playable ? 'Este tipo de partida aún está en desarrollo.' : '';
}

export function setCardsReady(ready) {
    cardsReady = ready;
    updateStartButton();
}

export function showLoadError(message) {
    const el = $('load-error');
    el.textContent = message;
    el.hidden = false;
}

/* ================= Inicialización ================= */

export function initStartScreen({ onStart }) {
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.onclick = () => { if (!btn.disabled && btn.dataset.panel !== currentPanel) openPanel(btn.dataset.panel); };
    });

    $('close-panel-btn').onclick = closePanel;

    $('mode-list').onclick = (e) => {
        const item = e.target.closest('.mode-item');
        if (!item || item.classList.contains('locked')) return;
        currentMode = item.dataset.mode;
        renderModes();
        renderOptions();
        updateStartButton();
    };

    $('mode-options').onclick = (e) => {
        const btn = e.target.closest('.opt-btn');
        if (!btn || btn.disabled) return;
        const choice = OPTION_DEFS[btn.dataset.key].choices.find(c => String(c.value) === btn.dataset.value);
        values[btn.dataset.key] = choice.value;
        renderOptions();
    };

    $('start-btn').onclick = () => {
        const mode = MODES[currentMode];
        if (!cardsReady || !mode.playable) return;
        const { cols, rows } = GRID_SIZES[values.gridSize];
        const settings = Object.fromEntries(mode.options.map(key => [key, values[key]]));
        onStart({
            playerCount: values.playerCount,
            modeName: mode.label,
            cols, rows,
            settings: { mode: currentMode, ...settings },
        });
    };

    renderModes();
    renderOptions();
    renderDecks([]);
    updateStartButton();
}