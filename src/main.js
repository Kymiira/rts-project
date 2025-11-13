import { Grid } from './game/grid.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// map config
const COLS = 200;
const ROWS = 200;
const baseTileSize = 32;

let grid = null;
let selectedTile = null;
let gameState = 'menu'; // 'menu' or 'playing'

// camera & zoom
let scale = 1;
let cameraX = 0; // world coords (pixels)
let cameraY = 0;

// dragging
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
    resizeCanvas();
    // If grid exists, re-center camera to ensure clamps change with new size
    if (grid) {
        clampCamera();
    }
});
resizeCanvas();

// --- helpers ---
function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

function getMapPixelSize() {
    if (!grid) return { w: 0, h: 0 };
    return { w: grid.cols * grid.tileSize, h: grid.rows * grid.tileSize };
}

function getMinScale() {
    // minimum scale so the entire map fits on screen
    if (!grid) return 1;
    const map = getMapPixelSize();
    const minScaleW = canvas.width / map.w;
    const minScaleH = canvas.height / map.h;
    // Use the smaller scale so both dimensions fit
    return Math.min(minScaleW, minScaleH, 1); // also avoid returning >1 if map smaller than screen
}

function getMaxScale() {
    const minScale = getMinScale();
    return minScale * 3;
}

function clampCamera() {
    if (!grid) return;

    const map = getMapPixelSize();
    const maxCamX = Math.max(0, map.w - canvas.width / scale);
    const maxCamY = Math.max(0, map.h - canvas.height / scale);

    cameraX = clamp(cameraX, 0, maxCamX);
    cameraY = clamp(cameraY, 0, maxCamY);
}

function centerCamera() {
    if (!grid) return;
    const map = getMapPixelSize();
    // Put camera so map is centered in the view given current scale
    cameraX = Math.max(0, (map.w - canvas.width / scale) / 2);
    cameraY = Math.max(0, (map.h - canvas.height / scale) / 2);
    clampCamera();
}

// --- game init / state ---
function initGame() {
    grid = new Grid(COLS, ROWS, baseTileSize);
    // set an initial scale that fits map or default 1
    scale = getMinScale();
    centerCamera();
    gameState = 'playing';
}

// Toggle menu
function toggleMenu() {
    gameState = gameState === 'playing' ? 'menu' : 'playing';
}

// --- zoom (bounded + centered on mouse) ---
function zoom(factor, mouseOffsetX = canvas.width / 2, mouseOffsetY = canvas.height / 2) {
    if (!grid) return;
    const oldScale = scale;
    let newScale = oldScale * factor;

    // compute dynamic limits
    const minScale = getMinScale();
    const maxScale = getMaxScale();

    // clamp requested scale
    newScale = clamp(newScale, minScale, maxScale);

    // if no change, bail
    if (Math.abs(newScale - oldScale) < 1e-6) {
        scale = newScale;
        return;
    }

    // convert mouse from canvas space to world coords (before zoom)
    // use offsetX/offsetY passed from wheel handler which are canvas-local
    const worldX = mouseOffsetX / oldScale + cameraX;
    const worldY = mouseOffsetY / oldScale + cameraY;

    // update scale
    scale = newScale;

    // compute camera so that mouse stays focused on same world point after zoom
    cameraX = worldX - mouseOffsetX / scale;
    cameraY = worldY - mouseOffsetY / scale;

    clampCamera();
}

// --- game loop ---
function update() {
    if (gameState === 'playing') {
        // future RTS logic (units/AI) goes here
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (grid) {
        // Draw visible tiles — grid.draw expects (ctx, scale, cameraX, cameraY)
        grid.draw(ctx, scale, cameraX, cameraY);
    }

    if (gameState === 'menu') {
        drawMenu();
    }
}

function drawMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Homebrew RTS', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '20px sans-serif';
    ctx.fillText('Press ENTER to Start / ESC to Toggle Menu', canvas.width / 2, canvas.height / 2 + 20);
}

// --- input handlers ---

// click selection (convert screen -> world)
canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing' || !grid) return;
    const rect = canvas.getBoundingClientRect();
    // use offset relative to canvas, then convert to world coords using scale + camera
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = canvasX / scale + cameraX;
    const worldY = canvasY / scale + cameraY;

    const tile = grid.getTileAt(worldX, worldY);
    if (tile) {
        if (selectedTile) selectedTile.selected = false;
        selectedTile = tile;
        selectedTile.selected = true;
    }
});

// drag to pan
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing' || !grid) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !grid) return;
    // compute delta in canvas pixels, convert to world pixels by dividing by scale
    const dx = (dragStartX - e.clientX) / scale;
    const dy = (dragStartY - e.clientY) / scale;

    cameraX += dx;
    cameraY += dy;

    dragStartX = e.clientX;
    dragStartY = e.clientY;

    clampCamera();
});

// wheel to zoom (use offsetX/Y for canvas-local coords)
canvas.addEventListener('wheel', (e) => {
    if (gameState !== 'playing' || !grid) return;
    e.preventDefault();
    // deltaY negative == scroll up (zoom in)
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    // e.offsetX/Y are relative to canvas element
    zoom(zoomFactor, e.offsetX, e.offsetY);
}, { passive: false });

// keyboard
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu();
    if (e.key === 'Enter' && gameState === 'menu') initGame();

    // optional keyboard zoom (centered)
    if (e.key === '=') { // = is often shift+'+'; include '=' for convenience
        zoom(1.12, canvas.width / 2, canvas.height / 2);
    }
    if (e.key === '-') {
        zoom(0.88, canvas.width / 2, canvas.height / 2);
    }
});

// start loop
requestAnimationFrame(function loop() {
    update();
    render();
    requestAnimationFrame(loop);
});
