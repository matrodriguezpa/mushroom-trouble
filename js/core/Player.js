import { Board } from './Board.js';

export class Player {
    constructor(id, name, cols = 3, rows = 3) {
        this.id = id; this.name = name;
        this.board = new Board(id, cols, rows);
        this.hand = []; this.maxHandSize = 5;
    }
}
