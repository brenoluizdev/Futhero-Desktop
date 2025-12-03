(async function() {
    console.log("[FPS Limiter] Verificando configuração...");

    const futheroAPI = window.futheroLauncherAPI;
    if (!futheroAPI) {
        console.log("[FPS Limiter] API não encontrada, abortando");
        return;
    }

    const fpsConfig = await futheroAPI.getFpsConfig();
    const fpsLimit = fpsConfig.fpsLimit;
    const isUnlimited = fpsConfig.unlimitedFPS;
    
    if (!fpsLimit && !isUnlimited) {
        console.log("[FPS Limiter] ✅ Modo padrão (nativo) - Nenhuma modificação será aplicada");
        return;
    }

    if (isUnlimited) {
        console.log("[FPS Limiter] ✅ Modo FPS ilimitado ativo - Nenhum limitador será aplicado");
        return;
    }

    if (window.__futheroFpsLimiterActive) {
        console.log("[FPS Limiter] Já existe uma instância ativa, abortando");
        return;
    }
    window.__futheroFpsLimiterActive = true;
    
    console.log(`[FPS Limiter] 🎯 Aplicando limite de ${fpsLimit} FPS...`);

    const frameInterval = 1000 / fpsLimit;

    function createLimiter(win, contextName) {
        const originalRAF = win.requestAnimationFrame.bind(win);
        const originalCAF = win.cancelAnimationFrame.bind(win);
        
        let lastTime = win.performance.now();
        let rafCallbacks = new Map();
        let nextId = 1;

        win.requestAnimationFrame = function(callback) {
            const now = win.performance.now();
            const timeSinceLastFrame = now - lastTime;
            
            if (timeSinceLastFrame >= frameInterval) {
                lastTime = now - (timeSinceLastFrame % frameInterval);
                return originalRAF(callback);
            }
            
            const delay = frameInterval - timeSinceLastFrame;
            const id = nextId++;
            
            const timeoutId = win.setTimeout(() => {
                rafCallbacks.delete(id);
                lastTime = win.performance.now();
                callback(lastTime);
            }, delay);
            
            rafCallbacks.set(id, timeoutId);
            return id;
        };

        win.cancelAnimationFrame = function(id) {
            const timeoutId = rafCallbacks.get(id);
            if (timeoutId !== undefined) {
                win.clearTimeout(timeoutId);
                rafCallbacks.delete(id);
            } else {
                originalCAF(id);
            }
        };

        console.log(`[FPS Limiter] ✅ Aplicado em ${contextName}`);
    }

    createLimiter(window, "window");

    function injectIframe() {
        const iframe = document.getElementById('maingameframe');
        if (!iframe?.contentWindow) {
            setTimeout(injectIframe, 100);
            return;
        }

        try {
            createLimiter(iframe.contentWindow, "iframe");
        } catch (e) {
            console.error("[FPS Limiter] Erro iframe:", e);
        }
    }

    injectIframe();
    console.log(`[FPS Limiter] ✅ Sistema ativo - ${fpsLimit} FPS`);
})();