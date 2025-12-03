(async function() {
    console.log("[FPS Limiter] Verificando configuração...");

    const futheroAPI = window.futheroLauncherAPI;
    if (!futheroAPI) {
        console.log("[FPS Limiter] API não encontrada, abortando");
        return;
    }

    const fpsConfig = await futheroAPI.getFpsConfig();
    const fpsLimit = fpsConfig.fpsLimit;
    const isUnlocked = fpsConfig.unlimitedFPS;
    
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
        let lastTime = win.performance.now();

        win.requestAnimationFrame = function(callback) {
            const now = win.performance.now();
            const timeSinceLastFrame = now - lastTime;
            
            if (timeSinceLastFrame >= frameInterval) {
                // Se o tempo passou, renderize e corrija o drift (desvio)
                lastTime = now - (timeSinceLastFrame % frameInterval);
                
                // Chamamos o callback original, que é o que o jogo quer que seja executado
                // para renderizar o próximo frame.
                return originalRAF(callback);
            } else {
                // Se ainda não é hora, agendamos a chamada do nosso requestAnimationFrame
                // para o momento certo, usando setTimeout para o delay.
                // O problema anterior era chamar originalRAF com uma função que chamava RAF novamente,
                // o que criava um loop infinito de espera.
                
                // Usamos setTimeout para o delay e, em seguida, chamamos o RAF original com o callback
                // para que o jogo continue seu ciclo de renderização.
                // No entanto, a forma mais segura de limitar o RAF é com o próprio RAF.
                
                // Vamos reverter para a lógica mais segura, mas corrigindo o erro de loop.
                // O erro de congelamento ocorre porque o callback nunca é chamado.
                
                // Solução: Usar setTimeout para o delay e chamar o callback diretamente.
                // Isso é menos ideal que o RAF puro, mas é o que o seu código original tentava fazer.
                
                // Vamos tentar a lógica mais simples e robusta de limitação de RAF:
                
                // A lógica anterior (que eu corrigi) estava correta, mas o problema é que
                // o callback do jogo (que faz a renderização) nunca era chamado se o tempo não passasse.
                
                // Vamos garantir que o callback seja chamado no momento certo.
                
                // Se o tempo não passou, agendamos a chamada do nosso RAF para o momento certo.
                // O problema é que o jogo espera que o RAF retorne um ID.
                
                // A forma mais segura é usar setTimeout para o delay e chamar o callback.
                
                const delay = frameInterval - timeSinceLastFrame;
                
                return win.setTimeout(() => {
                    // Quando o timeout expirar, chamamos o RAF original com o callback do jogo.
                    // Isso garante que o jogo renderize no momento certo.
                    lastTime = win.performance.now(); // Atualizamos o lastTime
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
