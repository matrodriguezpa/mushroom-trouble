// Pantalla de inicio: menú principal (Perfil, Mazos, Jugar, Créditos) con un panel que se expande.
// El panel "Jugar" contiene tipo de juego (local/online), tipo de partida, jugadores, opciones y mazo.
// No arranca la partida por sí sola: al pulsar "Listo" llama a onStart(config).

import { MODES, GAME_TYPES, OPTION_DEFS, GRID_SIZES, MAX_KINGDOMS, ENGINE_SUPPORT } from '../config/constants.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PROFILE_KEY = 'batallaReinos.playerName';
const DEFAULT_NAME = 'Jugador';

// Valores actuales de todas las opciones; se conservan al cambiar de modo.
const values = Object.fromEntries(Object.entries(OPTION_DEFS).map(([key, def]) => [key, def.default]));
let currentMode = 'ffa';
let gameType = 'local';
let currentPanel = null;
let cardsReady = false;

// Juego local: participantes extra además del jugador del perfil, que siempre está (1 + roster ≤ MAX_KINGDOMS).
// Humano: { type: 'human', name }  ·  Bot: { type: 'bot' } (su nombre "Bot #" se genera al mostrarlo).
const roster = [{ type: 'human', name: '' }];

/* ================= Perfil ================= */

function loadPlayerName() {
    try { return localStorage.getItem(PROFILE_KEY) || ''; } catch { return ''; }
}

function savePlayerName(name) {
    try { localStorage.setItem(PROFILE_KEY, name); } catch { /* sin almacenamiento disponible */ }
}

function getPlayerName() {
    return $('player-name').value.trim() || DEFAULT_NAME;
}

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

function optionRowsHtml(keys) {
    return keys.map(key => {
        const def = OPTION_DEFS[key];
        const buttons = def.choices.map(c => {
            const disabled = c.disabled || (def.isDisabled && def.isDisabled(c.value, values));
            return `<button class="opt-btn${values[key] === c.value ? ' active' : ''}" data-key="${key}" data-value="${c.value}"${disabled ? ' disabled' : ''}>${c.label}</button>`;
        }).join('');
        return `<div class="option-row"><label>${def.label}</label><div class="option-buttons">${buttons}</div></div>`;
    }).join('');
}

function renderOptions() {
    $('mode-options').innerHTML = optionRowsHtml(MODES[currentMode].options);
}

// Mantiene coherentes jugadores y bots del modo online: mínimo 2 reinos y máximo MAX_KINGDOMS.
function normalizeValues() {
    if (values.humanCount + values.botCount < 2) values.botCount = 2 - values.humanCount;
    if (values.humanCount + values.botCount > MAX_KINGDOMS) values.botCount = MAX_KINGDOMS - values.humanCount;
}

/* ================= Jugadores y bots ================= */

// Reparto actual de humanos y bots según el tipo de juego.
function counts() {
    if (gameType === 'local') {
        const bots = roster.filter(p => p.type === 'bot').length;
        return { humans: 1 + roster.length - bots, bots };
    }
    return { humans: values.humanCount, bots: values.botCount };
}

function kingdomCount() {
    if (MODES[currentMode].playerSetup) { const c = counts(); return c.humans + c.bots; }
    return values.teamCount * values.teamSize;
}

function localPlayersHtml() {
    const total = 1 + roster.length;
    let botN = 0;
    const rows = roster.map((p, i) => {
        const remove = `<button class="rm-btn" data-index="${i}" aria-label="Quitar" title="Quitar"${total <= 2 ? ' disabled' : ''}>−</button>`;
        return p.type === 'bot'
            ? `<div class="roster-row"><span class="roster-tag bot">Bot</span><span class="roster-name">Bot ${++botN}</span>${remove}</div>`
            : `<div class="roster-row"><span class="roster-tag">Jugador</span><input class="roster-input" data-index="${i}" maxlength="20" value="${esc(p.name)}" placeholder="Jugador ${i + 2}">${remove}</div>`;
    }).join('');
    const full = total >= MAX_KINGDOMS ? ' disabled' : '';
    return `
        <div class="section-title">Jugadores <span>${total} / ${MAX_KINGDOMS} reinos</span></div>
        <div class="roster">
            <div class="roster-row creator"><span class="roster-tag">Tú</span><span class="roster-name">${esc(getPlayerName())}</span></div>
            ${rows}
        </div>
        <div class="roster-actions">
            <button class="add-btn" data-add="human"${full}>+ Jugador</button>
            <button class="add-btn" data-add="bot"${full}>+ Bot</button>
        </div>`;
}

function renderPlayers() {
    const section = $('player-section');
    const show = MODES[currentMode].playerSetup;
    section.hidden = !show;
    section.innerHTML = !show ? '' : gameType === 'local'
        ? localPlayersHtml()
        : `<div class="section-title">Jugadores <span>máx. ${MAX_KINGDOMS} reinos</span></div>${optionRowsHtml(['humanCount', 'botCount'])}`;
}

// Lista final de participantes; el primero es el creador de la partida.
function buildPlayers() {
    const list = [{ name: getPlayerName(), type: 'human' }];
    if (gameType === 'local') {
        let botN = 0;
        roster.forEach(p => list.push(p.type === 'bot'
            ? { name: `Bot ${++botN}`, type: 'bot' }
            : { name: p.name.trim() || `Jugador ${list.length + 1}`, type: 'human' }));
    } else {
        for (let i = 1; i < values.humanCount; i++) list.push({ name: `Jugador ${list.length + 1}`, type: 'human' });
        for (let i = 1; i <= values.botCount; i++) list.push({ name: `Bot ${i}`, type: 'bot' });
    }
    return list;
}

/* ================= Mazo ================= */

// Los mazos aún no existen. Cuando se creen, llamar a renderDecks([{ id, name, thumb }]).
export function renderDecks(decks = []) {
    $('deck-list').innerHTML = decks.length === 0
        ? '<div class="deck-empty">Aún no tienes mazos. Aquí aparecerán los que crees, con su miniatura.</div>'
        : decks.map(d => `
            <div class="deck-item" data-deck="${d.id}">
                <div class="deck-thumb"${d.thumb ? ` style="background-image:url('${d.thumb}')"` : ''}></div>
                <span>${esc(d.name)}</span>
            </div>`).join('');
}

/* ================= Botón "Listo" ================= */

// Devuelve el motivo por el que la partida aún no puede iniciarse, o '' si todo está listo.
function blockedReason() {
    const mode = MODES[currentMode];
    if (!cardsReady) return 'Cargando cartas…';
    if (!GAME_TYPES[gameType].playable) return 'El juego online aún está en desarrollo.';
    if (!mode.playable) return 'Este tipo de partida aún está en desarrollo.';
    if (mode.playerSetup && counts().bots > 0 && !ENGINE_SUPPORT.bots) return 'Los bots aún están en desarrollo.';
    if (kingdomCount() > ENGINE_SUPPORT.maxKingdoms) return `El motor aún solo soporta ${ENGINE_SUPPORT.maxKingdoms} reinos.`;
    return '';
}

function updateStartButton() {
    const reason = blockedReason();
    $('start-btn').disabled = reason !== '';
    $('ready-hint').textContent = reason;
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

function onOptionClick(e) {
    const btn = e.target.closest('.opt-btn');
    if (!btn || btn.disabled) return;
    const choice = OPTION_DEFS[btn.dataset.key].choices.find(c => String(c.value) === btn.dataset.value);
    values[btn.dataset.key] = choice.value;
    normalizeValues();
    renderPlayers();
    renderOptions();
    updateStartButton();
}

export function initStartScreen({ onStart }) {
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.onclick = () => { if (!btn.disabled && btn.dataset.panel !== currentPanel) openPanel(btn.dataset.panel); };
    });

    $('close-panel-btn').onclick = closePanel;

    $('player-name').value = loadPlayerName();
    $('player-name').oninput = (e) => {
        savePlayerName(e.target.value.trim());
        renderPlayers(); // actualiza el nombre del creador en la lista
    };

    $('game-type').onclick = (e) => {
        const btn = e.target.closest('.type-btn');
        if (!btn) return;
        gameType = btn.dataset.type;
        document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b === btn));
        renderPlayers();
        updateStartButton();
    };

    $('mode-list').onclick = (e) => {
        const item = e.target.closest('.mode-item');
        if (!item || item.classList.contains('locked')) return;
        currentMode = item.dataset.mode;
        renderModes();
        renderPlayers();
        renderOptions();
        updateStartButton();
    };

    $('mode-options').onclick = onOptionClick;

    // Sección de jugadores: botones online (opt-btn) y lista local (+ / −).
    $('player-section').onclick = (e) => {
        if (e.target.closest('.opt-btn')) return onOptionClick(e);
        const add = e.target.closest('.add-btn');
        const remove = e.target.closest('.rm-btn');
        if (add && !add.disabled && 1 + roster.length < MAX_KINGDOMS) {
            roster.push(add.dataset.add === 'bot' ? { type: 'bot' } : { type: 'human', name: '' });
        } else if (remove && !remove.disabled && 1 + roster.length > 2) {
            roster.splice(Number(remove.dataset.index), 1);
        } else return;
        renderPlayers();
        updateStartButton();
    };

    // El nombre se guarda sin volver a dibujar la lista, para no perder el foco al escribir.
    $('player-section').oninput = (e) => {
        const input = e.target.closest('.roster-input');
        if (input) roster[Number(input.dataset.index)].name = input.value;
    };

    $('start-btn').onclick = () => {
        if (blockedReason()) return;
        const mode = MODES[currentMode];
        const { cols, rows } = GRID_SIZES[values.gridSize];
        const settings = Object.fromEntries(mode.options.map(key => [key, values[key]]));
        if (mode.playerSetup) Object.assign(settings, { humanCount: counts().humans, botCount: counts().bots });
        onStart({
            playerCount: kingdomCount(), // total de reinos (humanos + bots)
            players: buildPlayers(),     // [{ name, type: 'human' | 'bot' }], el primero es el creador
            modeName: mode.label,
            cols, rows,
            settings: { mode: currentMode, gameType, ...settings },
        });
    };

    renderModes();
    renderPlayers();
    renderOptions();
    renderDecks([]);
    updateStartButton();
}