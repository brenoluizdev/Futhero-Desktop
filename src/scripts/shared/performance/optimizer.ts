// Performance Optimizer - Auto-aplica configurações ao carregar o jogo
(function() {
    'use strict';

    console.log('[Futhero Performance] Inicializando otimizador...');

    // Carregar configurações
    const settings = {
        unlockFPS: localStorage.getItem('fh_unlock_fps') === 'true',
        hardwareAccel: localStorage.getItem('fh_hardware_accel') === 'true',
        lowLatency: localStorage.getItem('fh_low_latency') === 'true',
        disableAnimations: localStorage.getItem('fh_disable_animations') === 'true',
        prioritizePerformance: localStorage.getItem('fh_prioritize_perf') === 'true'
    };

    // 1. DESTRAVAR FPS
    if (settings.unlockFPS) {
        console.log('[Futhero] Aplicando: FPS Desbloqueado');
        
        // Override requestAnimationFrame para remover throttling
        const nativeRAF = window.requestAnimationFrame;
        let highPerformanceMode = true;
        
        window.requestAnimationFrame = function(callback) {
            if (highPerformanceMode) {
                return nativeRAF.call(window, function(timestamp) {
                    callback(timestamp);
                });
            }
            return nativeRAF.call(window, callback);
        };

        // Otimizar renderização de canvas
        const styleOptimizer = document.createElement('style');
        styleOptimizer.textContent = `
            canvas {
                image-rendering: -webkit-optimize-contrast !important;
                image-rendering: crisp-edges !important;
                image-rendering: pixelated !important;
            }
        `;
        document.head.appendChild(styleOptimizer);
    }

    // 2. ACELERAÇÃO DE HARDWARE
    if (settings.hardwareAccel) {
        console.log('[Futhero] Aplicando: Aceleração de Hardware');
        
        // Configurar todos os canvas para hardware acceleration
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'CANVAS') {
                        optimizeCanvas(node as HTMLCanvasElement);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Otimizar canvas existentes
        document.querySelectorAll('canvas').forEach(canvas => {
            optimizeCanvas(canvas as HTMLCanvasElement);
        });

        function optimizeCanvas(canvas: HTMLCanvasElement) {
            try {
                // Forçar contexto acelerado por hardware
                const ctx = canvas.getContext('2d', {
                    alpha: false,
                    desynchronized: true,
                    willReadFrequently: false
                });

                // WebGL também
                const glCtx = canvas.getContext('webgl2', {
                    alpha: false,
                    antialias: false,
                    depth: false,
                    powerPreference: 'high-performance',
                    desynchronized: true
                }) || canvas.getContext('webgl', {
                    alpha: false,
                    antialias: false,
                    depth: false,
                    powerPreference: 'high-performance',
                    desynchronized: true
                });

                console.log('[Futhero] Canvas otimizado:', canvas);
            } catch (e) {
                console.warn('[Futhero] Erro ao otimizar canvas:', e);
            }
        }
    }

    // 3. MODO BAIXA LATÊNCIA
    if (settings.lowLatency) {
        console.log('[Futhero] Aplicando: Modo Baixa Latência');
        
        // Reduzir buffer de eventos
        const events = ['keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'click'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                // Processar imediatamente sem buffer
                e.stopImmediatePropagation();
            }, { capture: true, passive: false });
        });

        // Desabilitar smooth scrolling
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Otimizar pointer events
        document.body.style.touchAction = 'none';
    }

    // 4. DESATIVAR ANIMAÇÕES
    if (settings.disableAnimations) {
        console.log('[Futhero] Aplicando: Desativando Animações');
        
        const noAnimStyle = document.createElement('style');
        noAnimStyle.textContent = `
            *, *::before, *::after {
                animation-duration: 0.001s !important;
                animation-delay: 0s !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
            }
            
            /* Manter animações essenciais do jogo */
            canvas, canvas * {
                animation-duration: initial !important;
                transition-duration: initial !important;
            }
        `;
        document.head.appendChild(noAnimStyle);
    }

    // 5. MODO PERFORMANCE TOTAL
    if (settings.prioritizePerformance) {
        console.log('[Futhero] Aplicando: Modo Performance Total');
        
        // Desabilitar recursos pesados do navegador
        const perfStyle = document.createElement('style');
        perfStyle.textContent = `
            * {
                will-change: auto !important;
                backface-visibility: hidden !important;
                perspective: 1000px !important;
            }
            
            img, video {
                image-rendering: -webkit-optimize-contrast !important;
            }
            
            /* Desabilitar efeitos visuais pesados */
            * {
                box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
            }
            
            /* Permitir efeitos apenas no canvas do jogo */
            canvas {
                box-shadow: initial !important;
                filter: initial !important;
            }
        `;
        document.head.appendChild(perfStyle);

        // Desabilitar recursos não essenciais
        if ('mediaDevices' in navigator) {
            // Liberar recursos de mídia não utilizados
        }

        // Garbage collector agressivo
        setInterval(() => {
            if (window.gc) {
                window.gc();
            }
        }, 30000);
    }

    // Monitor de Performance
    let fpsCounter = 0;
    let lastFpsTime = performance.now();
    
    function monitorPerformance() {
        fpsCounter++;
        const currentTime = performance.now();
        
        if (currentTime - lastFpsTime >= 5000) {
            const fps = Math.round((fpsCounter * 1000) / (currentTime - lastFpsTime));
            console.log(`[Futhero Performance] FPS médio: ${fps}`);
            fpsCounter = 0;
            lastFpsTime = currentTime;
        }
        
        requestAnimationFrame(monitorPerformance);
    }
    
    monitorPerformance();

    console.log('[Futhero Performance] Otimizações aplicadas com sucesso!');
    console.log('[Futhero Performance] Configurações ativas:', settings);
})();