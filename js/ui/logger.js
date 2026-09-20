import { state } from './state.js';

export function log(msg) {
    const engine = state.engine;
    const logs = document.getElementById('logs');
    if (!logs) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const turnInfo = engine ? `[${engine.getCurrentPlayer().name}]` : '[Sistema]';
    entry.textContent = `${turnInfo} ${msg}`;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
}
