// La ruta se resuelve respecto a este módulo, así funciona sin importar desde dónde se sirva el index.html.
const CARDS_URL = new URL('../../data/Cards.json', import.meta.url);

export async function loadCards(url = CARDS_URL) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`No se pudo leer ${String(url)} (HTTP ${response.status})`);
    }
    const cards = await response.json();
    validateCards(cards);
    return cards;
}

function validateCards(cards) {
    if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('Cards.json debe ser una lista de cartas con al menos un elemento.');
    }
    if (!cards.some(c => c.type === 'Rey')) {
        throw new Error('Cards.json debe incluir al menos una carta de tipo "Rey".');
    }
}
