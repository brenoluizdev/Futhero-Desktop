import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist-electron/injector",
    lib: {
      entry: path.resolve(__dirname, "electron/injector/injector.ts"),
      formats: ["cjs"],
      fileName: () => "injector.js",
    },
    minify: false,
  },
});
