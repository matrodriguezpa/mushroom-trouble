// Estado compartido de la interfaz (selección de cartas, acciones pendientes, drag & drop).
// Es un objeto único y mutable: todos los módulos de ui/ importan la misma instancia.
export const state = {
    engine: null,
    selectedCard: null,
    selectedCardIndex: null,
    selectedCardId: null,
    pendingBonus: false,
    pendingAttack: false,
    dragIndex: null,
};
