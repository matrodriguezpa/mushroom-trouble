// Etiquetas y configuraciones compartidas por la UI.

export const MODE_LABELS = {
    ffa: 'Free For All',
    race: 'Race',
    rush: 'Rush',
    '2v2': '2 vs 2',
    tournament: 'Tournament',
};

export const GRID_LABELS = {
    '3x3': 'Grid 3×3',
    '5x3': 'Grid 5×3',
};

// Mapeo: 3x3 → cols=3, rows=3 | 5x3 → cols=5, rows=3
export const GRID_SIZES = {
    '3x3': { cols: 3, rows: 3 },
    '5x3': { cols: 5, rows: 3 },
};
