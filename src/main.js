import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game grid settings
const COLS = 32;
const ROWS = 24;
const baseTileSize = 32;

let grid;
let selectedTile = null;
let gameState = 'menu'; // 'menu' or 'playing'

// Zoom / camera
let scale = 1;
let cameraX = 0;
let cameraY = 0;

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Get current tile size based on zoom
function getTileSize() {
    return baseTileSize;
}

// Initialize game
function initGame() {
    grid = new Grid(COLS, ROWS, getTileSize());
    gameState = 'playing';
}

// Toggle in-game menu
function toggleMenu() {
    gameState = (gameState === 'playing') ? 'menu' : 'playing';
}

// Zoom function
function zoom(factor) {
    const oldScale = scale;
    scale *= factor;
    scale = Math.max(0.2, Math.min(3, scale)); // clamp zoom
    // Optional: adjust cameraX/Y to zoom around center (future improvement)
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState === 'playing') {
        // Placeholder for future real-time RTS logic
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (grid) grid.draw(ctx, scale, cameraX, cameraY);

    if (gameState === 'menu') drawMenu();
}

// Menu overlay
function drawMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Homebrew RTS', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '24px sans-serif';
    ctx.fillText('Press ENTER to Start / ESC to Toggle Menu', canvas.width / 2, canvas.height / 2 + 20);
}

// Mouse click: select tiles (accounts for zoom)
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

// Keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu();
    if (e.key === 'Enter' && gameState === 'menu') initGame();
    if (e.key === '+') zoom(1.1);  // zoom in
    if (e.key === '-') zoom(0.9);  // zoom out
});

// Start the game loop
requestAnimationFrame(gameLoop);
