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
    
    if (isUnlimited) {
        console.log("[FPS Limiter] ✅ Modo FPS ilimitado ativo - Nenhum limitador será aplicado");
        return;
    }

    if (window.__futheroFpsLimiterActive) {
        console.log("[FPS Limiter] Já existe uma instância ativa, abortando");
        return;
    }
    window.__futheroFpsLimiterActive = true;
    
    const targetFps = fpsLimit || 60;
    console.log(`[FPS Limiter] 🎯 Aplicando limite de ${targetFps} FPS...`);

    const targetFrameTime = 1000 / targetFps;

    function createLimiter(win, contextName) {
        const originalRAF = win.requestAnimationFrame.bind(win);
        const originalCAF = win.cancelAnimationFrame.bind(win);
        
        let lastFrameTime = win.performance.now();
        let rafCallbacks = new Map();
        let nextId = 1;

        win.requestAnimationFrame = function(callback) {
            const callbackId = nextId++;
            
            const now = win.performance.now();
            const timeSinceLastFrame = now - lastFrameTime;
            
            if (timeSinceLastFrame < targetFrameTime) {
                const delay = targetFrameTime - timeSinceLastFrame;
                
                const timeoutId = win.setTimeout(() => {
                    rafCallbacks.delete(callbackId);
                    lastFrameTime = win.performance.now();
                    
                    callback(lastFrameTime);
                }, delay);
                
                rafCallbacks.set(callbackId, timeoutId);
                return callbackId;
            } else {
                lastFrameTime = now;
                return originalRAF(callback);
            }
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

        console.log(`[FPS Limiter] ✅ Aplicado em ${contextName} com limite de ${targetFps} FPS`);
    }

    createLimiter(window, "window");

    function injectIframe() {
        const iframe = document.getElementById('maingameframe');
        if (!iframe?.contentWindow) {
            setTimeout(injectIframe, 100);
            return;
        }

        try {
            if (!iframe.contentWindow.document.body) {
                setTimeout(injectIframe, 100);
                return;
            }
            
            createLimiter(iframe.contentWindow, "iframe (jogo)");
        } catch (e) {
            console.error("[FPS Limiter] Erro ao aplicar no iframe:", e);
        }
    }

    injectIframe();
    
    console.log(`[FPS Limiter] ✅ Sistema ativo - ${targetFps} FPS`);
    console.log(`[FPS Limiter] Modo: ${fpsLimit ? 'Customizado' : 'Padrão (60 FPS)'}`);
})();