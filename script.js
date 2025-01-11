import { loadShaders } from './sceneSetup.js';

loadShaders();

$(document).ready(function() {
    if(!$("#myCanvas").tagcanvas({
        textColour: "#ffffff",
        outlineColour: "transparent",
        reverse: true,
        depth: 0.8,
        maxSpeed: 0.05,
        weigth: true
    }, "knowledgeList")){
        $("canvasContainer");
    }
})

const canvas = document.getElementById('myCanvas'); // Get your canvas element

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;  // Get the device pixel ratio (default to 1 if not available)

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth *0.4;
    const viewportHeight = window.innerHeight *0.7;

    // Set the canvas width and height in pixels
    canvas.width = viewportWidth * dpr;  // Multiply by dpr for high-DPI scaling
    canvas.height = viewportHeight * dpr;  // Multiply by dpr for high-DPI scaling

    // Optionally, scale the canvas context to match device pixel ratio
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
}

// Initial resize
resizeCanvas();

// Debounced resize function to avoid excessive calculations
let resizeTimeout;
function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 100); // 100ms delay after resize stops
}

// Update canvas size when the window is resized
window.addEventListener('resize', debounceResize);