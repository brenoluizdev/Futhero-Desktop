import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist-electron",
    sourcemap: true,
    target: "node18",

    // Processo main deve ser tratado como LIB Node (não browser)
    lib: {
      entry: path.resolve(__dirname, "electron/main/index.ts"),
      formats: ["cjs"],
      fileName: () => "index.cjs",
    },

    rollupOptions: {
      external: [
        "electron",
        "electron-updater",
        "fs",
        "path",
        "os",
        "net",
        "http",
        "https",
        "crypto",
        "stream",
        "url",
        "child_process",
        "node:fs",
        "node:path",
        "node:url",
      ],
      output: {
        format: "cjs",
        entryFileNames: "[name].cjs",
      },
    },

    // remover erro "terser not found"
    minify: false,
  },

  ssr: {
    target: "node",
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
});
