import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist-electron/preload",
    lib: {
      entry: path.resolve(__dirname, "electron/preload/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: ["electron", "path", "fs"],
    },
    minify: false,
  },
});
