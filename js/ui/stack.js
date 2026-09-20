// Cartas apiladas en una celda (tierra, aire y sus bonus), en el orden en que se dibujan.
export function getStack(player, x, y) {
    const earth = player.board.earth[x][y];
    const air = player.board.air[x][y];
    const stack = [];
    if (earth) { stack.push({ card: earth, layer: 'earth', isBonus: false }); earth.attachedCards.forEach(b => stack.push({ card: b, layer: 'earth', isBonus: true })); }
    if (air) { stack.push({ card: air, layer: 'air', isBonus: false }); air.attachedCards.forEach(b => stack.push({ card: b, layer: 'air', isBonus: true })); }
    return stack;
}
