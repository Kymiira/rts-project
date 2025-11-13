import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const COLS = 32; // ~1024 px width
const ROWS = 24; // ~768 px height

let grid;
let selectedTile = null;
let gameState = 'menu'; // 'menu' or 'playing'

// Game initialization
function initGame() {
    grid = new Grid(COLS, ROWS, TILE_SIZE);
    gameState = 'playing';
}

// Toggle in-game menu
function toggleMenu() {
    gameState = (gameState === 'playing') ? 'menu' : 'playing';
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update logic
function update() {
    if (gameState === 'playing') {
        // Placeholder for future units, AI, and resources
    }
}

// Render everything
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (grid) grid.draw(ctx);

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

// Input handling
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

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu();
    if (e.key === 'Enter' && gameState === 'menu') initGame();
});

// Start game loop
requestAnimationFrame(gameLoop);

