import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let COLS = 32;
let ROWS = 24;
let baseTileSize = 32; // base size in pixels
let scale = 1;          // zoom factor
let grid;
let selectedTile = null;
let gameState = 'menu';

// Resize canvas to fill screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Calculate current tile size based on zoom
function getTileSize() {
    return baseTileSize * scale;
}

// Initialize game
function initGame() {
    grid = new Grid(COLS, ROWS, getTileSize());
    gameState = 'playing';
}

// Zoom in/out
function zoom(factor) {
    scale *= factor;
    scale = Math.max(0.2, Math.min(3, scale)); // clamp zoom between 0.2x and 3x
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
        grid.tileSize = getTileSize();
        grid.draw(ctx);
    }

    if (gameState === 'menu') drawMenu();
}

function drawMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Homebrew RTS', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '24px sans-serif';
    ctx.fillText('Press ENTER to Start / ESC to Toggle Menu', canvas.width/2, canvas.height/2 + 20);
}

// Input: select tiles
canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const tile = grid.getTileAt(px, py);
    if (tile) {
        if (selectedTile) selectedTile.selected = false;
        selectedTile = tile;
        selectedTile.selected = true;
    }
});

// Keyboard: menu toggle and zoom
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') gameState = (gameState === 'playing') ? 'menu' : 'playing';
    if (e.key === 'Enter' && gameState === 'menu') initGame();
    if (e.key === '+') zoom(1.1); // zoom in
    if (e.key === '-') zoom(0.9); // zoom out
});

requestAnimationFrame(gameLoop);
