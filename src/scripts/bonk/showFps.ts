(function() {
    'use strict';

    if (document.getElementById('futhero-fps-display')) {
        return;
    }

    const fpsDisplay = document.createElement('div');
    fpsDisplay.id = 'futhero-fps-display';
    fpsDisplay.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: #00ff00;
        padding: 8px 12px;
        border-radius: 5px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        font-weight: bold;
        z-index: 999999;
        pointer-events: none;
        user-select: none;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 255, 0, 0.3);
    `;
    fpsDisplay.textContent = 'FPS: --';

    function addToPage() {
        if (document.body) {
            document.body.appendChild(fpsDisplay);
            console.log('[Futhero] FPS Display adicionado');
        } else {
            setTimeout(addToPage, 100);
        }
    }
    addToPage();

    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    const fpsUpdateInterval = 500;
    let lastFpsUpdate = performance.now();

    function updateFPS() {
        const currentTime = performance.now();
        frames++;

        if (currentTime - lastFpsUpdate >= fpsUpdateInterval) {
            const delta = currentTime - lastFpsUpdate;
            fps = Math.round((frames * 1000) / delta);
            
            if (fps >= 50) {
                fpsDisplay.style.color = '#00ff00';
            } else if (fps >= 30) {
                fpsDisplay.style.color = '#ffff00';
            } else {
                fpsDisplay.style.color = '#ff0000';
            }
            
            fpsDisplay.textContent = `FPS: ${fps}`;
            
            frames = 0;
            lastFpsUpdate = currentTime;
        }

        requestAnimationFrame(updateFPS);
    }

    requestAnimationFrame(updateFPS);

    console.log('[Futhero] Sistema de FPS inicializado para Bonk.io');
})();