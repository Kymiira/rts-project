import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 200;
const ROWS = 200;
const baseTileSize = 32;

let grid;
let selectedTile = null;
let gameState = 'menu';

let scale = 1;
let cameraX = 0;
let cameraY = 0;

// Dragging
let isDragging = false;
let dragStartX, dragStartY;

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

/* -------------------------------------------------------
   ZOOM HANDLING (bounded + centered)
------------------------------------------------------- */
function zoom(factor, mouseX = canvas.width / 2, mouseY = canvas.height / 2) {
    const oldScale = scale;
    scale *= factor;

    // Compute map pixel dimensions
    const mapPixelWidth = grid.cols * grid.tileSize;
    const mapPixelHeight = grid.rows * grid.tileSize;

    // Compute minScale so entire map fits screen
    const minScale = Math.min(canvas.width / mapPixelWidth, canvas.height / mapPixelHeight);

    // Clamp zoom
    scale = Math.max(minScale, Math.min(3, scale));

    // Zoom toward mouse pointer (natural zoom)
    const worldX = (mouseX / oldScale + cameraX);
    const worldY = (mouseY / oldScale + cameraY);
    cameraX = worldX - mouseX / scale;
    cameraY = worldY - mouseY / scale;

    clampCamera();
}

/* -------------------------------------------------------
   CAMERA CLAMP
------------------------------------------------------- */
function clampCamera() {
    const maxCamX = grid.cols * grid.tileSize - canvas.width / scale;
    const maxCamY = grid.rows * grid.tileSize - canvas.height / scale;

    cameraX = Math.max(0, Math.min(cameraX, maxCamX));
    cameraY = Math.max(0, Math.min(cameraY, maxCamY));
}

/* -------------------------------------------------------
   GAME LOOP
------------------------------------------------------- */
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState === 'playing') {
        // Future RTS logic goes here
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (grid) {
        grid.draw(ctx, scale, cameraX, cameraY);
    }

    if (gameState === 'menu') drawMenu();
}

/* -------------------------------------------------------
   MENU
------------------------------------------------------- */
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

/* -------------------------------------------------------
   TILE SELECTION
------------------------------------------------------- */
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

/* -------------------------------------------------------
   CAMERA DRAGGING
------------------------------------------------------- */
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

    clampCamera();
});

/* -------------------------------------------------------
   KEYBOARD + MOUSE INPUT
------------------------------------------------------- */
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu();
    if (e.key === 'Enter' && gameState === 'menu') initGame();
});

canvas.addEventListener('wheel', (e) => {
    if (gameState !== 'playing') return;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoom(zoomFactor, e.clientX, e.clientY);
    e.preventDefault();
});

requestAnimationFrame(gameLoop);
