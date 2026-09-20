export class Card {
    constructor(config) {
        Object.assign(this, config);
        this.id = config.id + '_' + Math.random().toString(36).substring(2, 8);
        this.currentHealth = config.health.value;
        this.position = { x: null, y: null, layer: null };
        this.attachedCards = [];
    }
}
