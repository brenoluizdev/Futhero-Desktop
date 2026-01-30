const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../assets");
const dest = path.join(__dirname, "../dist/assets");

function copyRecursive(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) {
        console.log(`⚠️  Diretório não existe, pulando: ${srcDir}`);
        return;
    }

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const items = fs.readdirSync(srcDir);

    for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const destPath = path.join(destDir, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Copied: ${path.relative(__dirname, srcPath)} -> ${path.relative(__dirname, destPath)}`);
        }
    }
}

console.log("\n📁 Copiando assets...\n");
copyRecursive(src, dest);
console.log("\n✨ Cópia de assets concluída!\n");
