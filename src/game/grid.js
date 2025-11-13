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

        // Procedural map generation: circular island with resources
        const centerX = cols / 2;
        const centerY = rows / 2;
        const maxRadius = Math.min(cols, rows) / 2 - 5; // island radius

        for (let x = 0; x < cols; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < rows; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let type = 'water';
                if (dist < maxRadius * (0.8 + Math.random() * 0.2)) {
                    type = 'grass';
                }

                if (type === 'grass' && Math.random() < 0.02) {
                    type = 'gold';
                }

                this.tiles[x][y] = new Tile(x, y, type);
            }
        }
    }

    draw(ctx, scale = 1, cameraX = 0, cameraY = 0) {
        const tileSize = this.tileSize * scale;
        const screenWidth = ctx.canvas.width;
        const screenHeight = ctx.canvas.height;

        // Only draw visible tiles based on camera position and zoom
        const startCol = Math.floor(cameraX / this.tileSize);
        const endCol = Math.min(this.cols, Math.ceil((cameraX + screenWidth / scale) / this.tileSize));
        const startRow = Math.floor(cameraY / this.tileSize);
        const endRow = Math.min(this.rows, Math.ceil((cameraY + screenHeight / scale) / this.tileSize));

        for (let x = startCol; x < endCol; x++) {
            for (let y = startRow; y < endRow; y++) {
                const tile = this.tiles[x][y];
                const px = (x * this.tileSize - cameraX) * scale;
                const py = (y * this.tileSize - cameraY) * scale;

                ctx.fillStyle =
                    tile.selected
                        ? '#888'
                        : tile.type === 'plain'
                        ? '#555'
                        : tile.type === 'grass'
                        ? '#3a7d3a'
                        : '#aa0'; // gold

                ctx.fillRect(px, py, tileSize, tileSize);
                ctx.strokeStyle = '#222';
                ctx.strokeRect(px, py, tileSize, tileSize);
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
