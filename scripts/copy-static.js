const fs = require("fs");
const path = require("path");

const rendererSrc = path.join(__dirname, "../src/renderer");
const rendererDest = path.join(__dirname, "../dist/renderer");

const assetsSrc = path.join(__dirname, "../src/assets");
const assetsDest = path.join(__dirname, "../dist/assets");

const scriptsSrc = path.join(__dirname, "../src/scripts");
const scriptsDest = path.join(__dirname, "../dist/scripts");

const uiSrc = path.join(__dirname, "../src/ui");
const uiDest = path.join(__dirname, "../dist/ui");

const cssSrc = path.join(__dirname, "../src/css");
const cssDest = path.join(__dirname, "../dist/css");

const allowed = [".html", ".css", ".png", ".jpg", ".jpeg", ".svg", ".js", ".ico"];

function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyFolder(srcPath, destPath);
        } else if (allowed.includes(path.extname(item))) {
            fs.copyFileSync(srcPath, destPath);
            console.log("Copied:", destPath);
        }
    }
}

copyFolder(rendererSrc, rendererDest);
copyFolder(assetsSrc, assetsDest);
copyFolder(scriptsSrc, scriptsDest);
copyFolder(cssSrc, cssDest);
copyFolder(uiSrc, uiDest);

console.log("Static files copied!");
