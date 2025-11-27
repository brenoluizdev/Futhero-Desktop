/**
 * Configuração principal do Electron
 * Define paths, versão e configurações de build
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const electronConfig = {
  // Paths
  main: path.join(__dirname, "dist-electron/index.js"),
  preload: path.join(__dirname, "dist-electron/preload.js"),
  renderer: path.join(__dirname, "dist/index.html"),

  // Versão
  version: "1.0.0",

  // Configurações de build
  build: {
    outDir: "dist-electron",
    sourcemap: true,
    minify: "terser",
  },

  // Configurações de segurança
  security: {
    contextIsolation: true,
    enableRemoteModule: false,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
  },

  // Configurações de auto-update
  autoUpdate: {
    enabled: true,
    checkInterval: 3600000, // 1 hora em ms
    provider: "github",
  },

  // Configurações de janela
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "dist-electron/preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  },
};

export default electronConfig;
