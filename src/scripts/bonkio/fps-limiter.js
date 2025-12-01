(async function() {
    console.log("[FPS Limiter] Verificando configuração...");

    const futheroAPI = window.futheroLauncherAPI;
    if (!futheroAPI) {
        console.log("[FPS Limiter] API não encontrada, abortando");
        return;
    }

    const fpsLimit = await futheroAPI.getFpsLimit();
    const isUnlocked = await futheroAPI.isUnlockedFps();
    
    if (!fpsLimit && !isUnlocked) {
        console.log("[FPS Limiter] ✅ Modo padrão (nativo) - Nenhuma modificação será aplicada");
        return;
    }

    if (isUnlocked) {
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
        let lastTime = Date.now();

        win.requestAnimationFrame = function(callback) {
            const now = Date.now();
            const timeSinceLastFrame = now - lastTime;
            
            if (timeSinceLastFrame >= frameInterval) {
                lastTime = now - (timeSinceLastFrame % frameInterval);
                return originalRAF(callback);
            } else {
                const delay = frameInterval - timeSinceLastFrame;
                return setTimeout(() => {
                    lastTime = Date.now();
                    originalRAF(callback);
                }, delay);
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