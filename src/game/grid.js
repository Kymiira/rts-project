export class Tile {
    constructor(x, y, type = 'plain') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.selected = false;
    }
}

export class Grid {
    constructor(cols, rows, tileSize) {
        this.cols = cols;
        this.rows = rows;
        this.tileSize = tileSize;
        this.tiles = [];

        for (let x = 0; x < cols; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < rows; y++) {
                this.tiles[x][y] = new Tile(x, y);
            }
        }
    }

    draw(ctx, scale = 1, cameraX = 0, cameraY = 0) {
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const tile = this.tiles[x][y];
                const px = (x * this.tileSize - cameraX) * scale;
                const py = (y * this.tileSize - cameraY) * scale;
                const size = this.tileSize * scale;

                ctx.fillStyle = tile.selected ? '#888' : (tile.type === 'plain' ? '#555' : '#aa0');
                ctx.fillRect(px, py, size, size);
                ctx.strokeStyle = '#222';
                ctx.strokeRect(px, py, size, size);
            }
        }
    }

    getTileAt(px, py) {
        const x = Math.floor(px / this.tileSize);
        const y = Math.floor(py / this.tileSize);
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) return this.tiles[x][y];
        return null;
    }
}
