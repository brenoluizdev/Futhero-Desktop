(function() {
    'use strict';

    interface PerformanceSettings {
        unlockFPS: boolean;
        targetFPS: number;
        showFPS: boolean;
    }

    class PerformanceManager {
        private settings: PerformanceSettings;
        private originalRequestAnimationFrame: typeof requestAnimationFrame;
        private fpsUnlocked: boolean = false;

        constructor() {
            this.settings = this.loadSettings();
            this.originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
            
            (window as any).futheroPerformance = {
                toggleUnlockFPS: () => this.toggleUnlockFPS(),
                setTargetFPS: (fps: number) => this.setTargetFPS(fps),
                getSettings: () => this.getSettings(),
                isUnlocked: () => this.fpsUnlocked
            };

            if (this.settings.unlockFPS) {
                this.unlockFPS();
            }

            console.log('[PerformanceManager] Inicializado', this.settings);
        }

        private loadSettings(): PerformanceSettings {
            try {
                const saved = localStorage.getItem('futhero_performance_settings');
                if (saved) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error('[PerformanceManager] Erro ao carregar configurações:', e);
            }

            return {
                unlockFPS: false,
                targetFPS: 240,
                showFPS: true
            };
        }

        private saveSettings() {
            try {
                localStorage.setItem('futhero_performance_settings', JSON.stringify(this.settings));
                console.log('[PerformanceManager] Configurações salvas:', this.settings);
            } catch (e) {
                console.error('[PerformanceManager] Erro ao salvar configurações:', e);
            }
        }

        public getSettings(): PerformanceSettings {
            return { ...this.settings };
        }

        public toggleUnlockFPS(): boolean {
            if (this.fpsUnlocked) {
                this.lockFPS();
            } else {
                this.unlockFPS();
            }
            return this.fpsUnlocked;
        }

        private unlockFPS() {
            if (this.fpsUnlocked) return;

            console.log('[PerformanceManager] 🚀 Desbloqueando FPS...');

            const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
            if (iframe?.contentWindow) {
                try {
                    const iframeWin = iframe.contentWindow as any;
                    
                    iframeWin.requestAnimationFrame = (callback: FrameRequestCallback) => {
                        return this.originalRequestAnimationFrame(callback);
                    };

                    const originalSetTimeout = iframeWin.setTimeout;
                    iframeWin.setTimeout = function(fn: Function, delay: number, ...args: any[]) {
                        if (delay === 16 || delay === 17) {
                            delay = 0;
                        }
                        return originalSetTimeout(fn, delay, ...args);
                    };

                    console.log('[PerformanceManager] ✅ FPS desbloqueado no iframe');
                } catch (e) {
                    console.error('[PerformanceManager] Erro ao desbloquear FPS no iframe:', e);
                }
            }
            
            window.requestAnimationFrame = (callback: FrameRequestCallback) => {
                return this.originalRequestAnimationFrame(callback);
            };

            this.fpsUnlocked = true;
            this.settings.unlockFPS = true;
            this.saveSettings();

            if ((window as any).futheroLauncherAPI) {
                (window as any).futheroLauncherAPI.sendNotification('🚀 FPS Desbloqueado! Jogo rodando sem limites.');
            }
        }

        private lockFPS() {
            if (!this.fpsUnlocked) return;

            console.log('[PerformanceManager] 🔒 Bloqueando FPS...');

            const iframe = document.getElementById('maingameframe') as HTMLIFrameElement;
            if (iframe?.contentWindow) {
                try {
                    const iframeWin = iframe.contentWindow as any;
                    iframeWin.requestAnimationFrame = this.originalRequestAnimationFrame;
                } catch (e) {
                    console.error('[PerformanceManager] Erro ao bloquear FPS no iframe:', e);
                }
            }

            window.requestAnimationFrame = this.originalRequestAnimationFrame;

            this.fpsUnlocked = false;
            this.settings.unlockFPS = false;
            this.saveSettings();

            if ((window as any).futheroLauncherAPI) {
                (window as any).futheroLauncherAPI.sendNotification('🔒 FPS Bloqueado. Comportamento padrão restaurado.');
            }
        }

        public setTargetFPS(fps: number) {
            this.settings.targetFPS = Math.max(30, Math.min(fps, 240));
            this.saveSettings();
            console.log('[PerformanceManager] Target FPS definido:', this.settings.targetFPS);
        }

        public toggleShowFPS(): boolean {
            this.settings.showFPS = !this.settings.showFPS;
            this.saveSettings();
            
            const fpsDisplay = document.getElementById('futhero-fps-display');
            if (fpsDisplay) {
                fpsDisplay.style.display = this.settings.showFPS ? 'block' : 'none';
            }
            
            return this.settings.showFPS;
        }
    }

    function init() {
        if ((window as any).futheroPerformanceManager) {
            console.log('[PerformanceManager] Já inicializado');
            return;
        }

        const manager = new PerformanceManager();
        (window as any).futheroPerformanceManager = manager;
        console.log('[PerformanceManager] ✅ Sistema de performance ativo');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();