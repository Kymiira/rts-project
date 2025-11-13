import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 200; // reasonable size for demo
const ROWS = 200;
const baseTileSize = 32;

let grid;
let selectedTile = null;
let gameState = 'menu';

// Zoom / camera
let scale = 1;
let cameraX = 0;
let cameraY = 0;

// Dragging variables
let isDragging = false;
let dragStartX, dragStartY;

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getTileSize() {
    return baseTileSize;
}

function initGame() {
    grid = new Grid(COLS, ROWS, getTileSize());
    gameState = 'playing';
}

function toggleMenu() {
    gameState = gameState === 'playing' ? 'menu' : 'playing';
}

function zoom(factor) {
    scale *= factor;
    scale = Math.max(0.2, Math.min(3, scale));
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState === 'playing') {
        // Placeholder for future RTS logic
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (grid) {
        const gridWidth = grid.cols * grid.tileSize * scale;
        const gridHeight = grid.rows * grid.tileSize * scale;
        const offsetX = (canvas.width - gridWidth) / 2;
        const offsetY = (canvas.height - gridHeight) / 2;

        grid.draw(ctx, scale, -offsetX / scale + cameraX, -offsetY / scale + cameraY);
    }

    if (gameState === 'menu') drawMenu();
}

function drawMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Homebrew RTS', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '24px sans-serif';
    ctx.fillText(
        'Press ENTER to Start / ESC to Toggle Menu',
        canvas.width / 2,
        canvas.height / 2 + 20
    );
}

// Tile selection with zoom and camera offset
canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) / scale + cameraX;
    const py = (e.clientY - rect.top) / scale + cameraY;

    const tile = grid.getTileAt(px, py);
    if (tile) {
        if (selectedTile) selectedTile.selected = false;
        selectedTile = tile;
        selectedTile.selected = true;
    }
});

// Camera dragging
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing') return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = (dragStartX - e.clientX) / scale;
    const dy = (dragStartY - e.clientY) / scale;

    cameraX += dx;
    cameraY += dy;

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    // Clamp camera
    cameraX = Math.max(0, Math.min(cameraX, grid.cols * grid.tileSize - canvas.width / scale));
    cameraY = Math.max(0, Math.min(cameraY, grid.rows * grid.tileSize - canvas.height / scale));
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu();
    if (e.key === 'Enter' && gameState === 'menu') initGame();
    if (e.key === '+') zoom(1.1);
    if (e.key === '-') zoom(0.9);
});

requestAnimationFrame(gameLoop);
