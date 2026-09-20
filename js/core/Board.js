export class Board {
    constructor(playerId, cols = 3, rows = 3) {
        this.playerId = playerId;
        this.cols = cols;
        this.rows = rows;
        this.earth = Array(cols).fill(null).map(() => Array(rows).fill(null));
        this.air = Array(cols).fill(null).map(() => Array(rows).fill(null));
        this.maxCards = 8;
    }
    getBackRow() { return this.rows - 1; }

    getHeads() {
        const heads = [];
        for (let x = 0; x < this.cols; x++) {
            for (const layer of ['earth', 'air']) {
                const grid = this[layer];
                for (let y = 0; y < this.rows; y++) {
                    if (grid[x][y]) { heads.push(grid[x][y]); break; }
                }
            }
        }
        return heads;
    }
    isBackRowProtected(layer) {
        const grid = this[layer];
        const backRow = this.getBackRow();
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < backRow; y++) {
                if (grid[x][y]) return true;
            }
        }
        return false;
    }
    canBeAttacked(target, attacker) {
        const layer = target.position.layer;
        const { x: tx, y: ty } = target.position;
        const ax = attacker.position.x;
        const grid = this[layer];
        const backRow = this.getBackRow();

        if (ty === backRow && this.isBackRowProtected(layer)) return false;
        if (attacker.position.layer === 'air') return true;
        if (ty > 0 && grid[tx][ty - 1] && ax !== tx) return false;
        if (ty > 0 && tx > 0 && grid[tx - 1][ty - 1] && ax <= tx - 1) return false;
        if (ty > 0 && tx < this.cols - 1 && grid[tx + 1][ty - 1] && ax >= tx + 1) return false;
        return true;
    }
}
