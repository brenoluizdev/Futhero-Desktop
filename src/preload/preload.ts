import { contextBridge, ipcRenderer } from "electron";

interface PerformanceSettings {
    unlockFPS: boolean;
    hardwareAccel: boolean;
    lowLatency: boolean;
    disableAnimations: boolean;
    prioritizePerformance: boolean;
}

contextBridge.exposeInMainWorld("fh", {
    injectFile(filePath: string) {
        const script = document.createElement("script");
        script.src = filePath;
        script.type = "text/javascript";
        document.head.appendChild(script);
    },
    
    // API para aplicar configurações de performance
    applyPerformanceSettings: async (settings: PerformanceSettings) => {
        try {
            const result = await ipcRenderer.invoke("apply-performance-settings", {
                unlockFPS: Boolean(settings.unlockFPS),
                hardwareAccel: Boolean(settings.hardwareAccel),
                lowLatency: Boolean(settings.lowLatency),
                disableAnimations: Boolean(settings.disableAnimations),
                prioritizePerformance: Boolean(settings.prioritizePerformance)
            });
            return result;
        } catch (error) {
            console.error("[Preload] Erro ao aplicar configurações:", error);
            return { success: false, error: String(error) };
        }
    }
});