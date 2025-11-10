const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../src/scripts");
const dest = path.join(__dirname, "../dist/scripts");

const allowed = [".css", ".png", ".jpg", ".jpeg", ".svg", ".json", ".html"];

function copyStatic(srcDir, destDir) {
    if (!fs.existsSync(destDir))
        fs.mkdirSync(destDir, { recursive: true });

    for (const item of fs.readdirSync(srcDir)) {
        const srcPath = path.join(srcDir, item);
        const destPath = path.join(destDir, item);

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyStatic(srcPath, destPath);
        } else {
            const ext = path.extname(item).toLowerCase();

            if (allowed.includes(ext)) {
                fs.copyFileSync(srcPath, destPath);
                console.log("Copied:", srcPath, "->", destPath);
            }
        }
    }
}

copyStatic(src, dest);
console.log("✅ Static files copied.");