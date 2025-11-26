"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("fh", {
    injectFile(filePath) {
        const script = document.createElement("script");
        script.src = filePath;
        script.type = "text/javascript";
        document.head.appendChild(script);
    },
    // API para aplicar configurações de performance
    applyPerformanceSettings: async (settings) => {
        try {
            const result = await electron_1.ipcRenderer.invoke("apply-performance-settings", {
                unlockFPS: Boolean(settings.unlockFPS),
                hardwareAccel: Boolean(settings.hardwareAccel),
                lowLatency: Boolean(settings.lowLatency),
                disableAnimations: Boolean(settings.disableAnimations),
                prioritizePerformance: Boolean(settings.prioritizePerformance)
            });
            return result;
        }
        catch (error) {
            console.error("[Preload] Erro ao aplicar configurações:", error);
            return { success: false, error: String(error) };
        }
    }
});
