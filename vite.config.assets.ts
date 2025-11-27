import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

const assetsPath = path.resolve(__dirname, "assets");
const distPath = path.resolve(__dirname, "dist-electron/assets");

function copyAssets() {
  return {
    name: "copy-assets",
    buildEnd() {
      if (!fs.existsSync(assetsPath)) return;

      fs.mkdirSync(distPath, { recursive: true });

      const entries = fs.readdirSync(assetsPath, { withFileTypes: true });
      for (const entry of entries) {
        const src = path.join(assetsPath, entry.name);
        const dest = path.join(distPath, entry.name);

        if (entry.isDirectory()) {
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
      console.log("✅ Assets copiados para dist-electron/assets");
    },
  };
}

export default defineConfig({
  plugins: [copyAssets()],
  build: {
    emptyOutDir: false,
    outDir: "dist-electron/assets",
    minify: false,
  },
});
