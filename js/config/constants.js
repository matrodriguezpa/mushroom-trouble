// Etiquetas y configuraciones compartidas por la UI.

// Tamaño del grid → columnas y filas del tablero.
export const GRID_SIZES = {
    '3x3': { cols: 3, rows: 3 },
    '5x3': { cols: 5, rows: 3 },
};

export const GRID_LABELS = {
    '3x3': 'Grid 3×3',
    '5x3': 'Grid 5×3',
};

// Regla: máximo de reinos en una partida (jugadores humanos + bots). Siempre hay al menos
// un humano (el creador de la partida) y un mínimo de 2 reinos.
export const MAX_KINGDOMS = 6;

// Capacidad actual del motor (provisional): subir estos valores cuando el motor soporte más reinos y bots.
export const ENGINE_SUPPORT = { maxKingdoms: 2, bots: false };

// Tipos de juego. `playable`: el motor ya puede arrancar una partida de este tipo.
export const GAME_TYPES = {
    local:  { label: 'Local',  playable: true },
    online: { label: 'Online', playable: false }, // TODO: activar cuando exista el modo online
};

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const numbers = (list, disabledFrom = Infinity) =>
    list.map(v => ({ value: v, label: String(v), disabled: v >= disabledFrom }));

// Definición de cada opción configurable. `disabled` marca valores que el motor aún no soporta.
// Los valores por defecto son provisionales: ajústalos a las reglas reales del juego.
export const OPTION_DEFS = {
    // humanCount y botCount solo se usan en juego online. En local los jugadores y bots son una lista.
    // `isDisabled(valor, valoresActuales)` bloquea opciones que dependen de otras.
    humanCount:      { label: 'Cantidad de jugadores',     default: 2, choices: numbers(range(1, 6)),
                       isDisabled: (v, vals) => v + vals.botCount > MAX_KINGDOMS },
    botCount:        { label: 'Cantidad de bots',          default: 0, choices: numbers(range(0, 5)),
                       isDisabled: (v, vals) => vals.humanCount + v > MAX_KINGDOMS || (v === 0 && vals.humanCount < 2) },
    teamCount:       { label: 'Cantidad de equipos',       default: 2, choices: numbers(range(2, 4)) },
    teamSize:        { label: 'Jugadores por equipo',      default: 2, choices: numbers(range(2, 3)) },
    kingLives:       { label: 'Máximo de vidas de rey',    default: 3, choices: numbers(range(1, 5)) },
    kingDamageLimit: { label: 'Límite de daño al rey',     default: 0, choices: [{ value: 0, label: 'Sin límite' }, ...numbers(range(1, 3))] },
    gridSize:        { label: 'Tamaño de reinos',          default: '3x3', choices: Object.entries(GRID_LABELS).map(([value, label]) => ({ value, label: label.replace('Grid ', '') })) },
    handLimit:       { label: 'Máximo de cartas en mano',  default: 5, choices: numbers(range(3, 7)) },
    benchLimit:      { label: 'Máximo de cartas de banco', default: 3, choices: numbers(range(0, 5)) },
};

// Tipos de partida. `locked`: aparece en la lista pero no se puede elegir.
// `playable`: el motor ya puede arrancar una partida de este tipo (el botón "Listo" depende de esto).
export const MODES = {
    ffa: {
        label: 'Todos contra todos',
        description: 'Todos los jugadores se enfrentan entre sí; gana el último rey en pie.',
        playable: true,
        playerSetup: true, // usa la sección de jugadores y bots (local: lista con +/−; online: botones)
        options: ['kingLives', 'kingDamageLimit', 'gridSize', 'handLimit', 'benchLimit'],
    },
    teams: {
        label: 'Equipos',
        description: 'Los jugadores aliados unen fuerzas para eliminar a todos los equipos rivales.',
        playable: false, // TODO: cambiar a true cuando el motor soporte equipos
        options: ['teamCount', 'teamSize', 'kingLives', 'kingDamageLimit', 'gridSize', 'handLimit', 'benchLimit'],
    },
    tournament: {
        label: 'Torneo',
        description: 'Eliminación directa: quien gane su partida avanza de ronda hasta la gran final.',
        locked: true,
        options: [],
    },
    rush: {
        label: 'Rápida',
        description: 'Partidas ágiles con las condiciones mínimas para que tu rey sobreviva.',
        locked: true,
        options: [],
    },
    race: {
        label: 'Carrera',
        description: 'Reinos alargados por donde las cartas avanzan a toda velocidad; gana quien alcance tres veces el lado opuesto del enemigo.',
        locked: true,
        options: [],
    },
};

// Compatibilidad con código existente que use MODE_LABELS.
export const MODE_LABELS = Object.fromEntries(Object.entries(MODES).map(([id, m]) => [id, m.label]));