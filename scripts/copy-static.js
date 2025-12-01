const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../src/scripts");
const dest = path.join(__dirname, "../dist/scripts");

const srcPages = path.join(__dirname, "../src/pages");
const destPages = path.join(__dirname, "../dist/pages");

const srcConfigs = path.join(__dirname, "../src/configs");
const destConfigs = path.join(__dirname, "../dist/configs");

const gameSelectorSrc = path.join(__dirname, "../src/game-selector.html");
const gameSelectorDest = path.join(__dirname, "../dist/pages/game-selector.html");

const allowed = [".css", ".png", ".jpg", ".jpeg", ".svg", ".json", ".html", ".js"];

function copyJsRecursive(srcDir, destDir) {
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
            copyJsRecursive(srcPath, destPath);
        } else {
            const ext = path.extname(item).toLowerCase();

            if (allowed.includes(ext)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`✅ Copied: ${path.relative(__dirname, srcPath)} -> ${path.relative(__dirname, destPath)}`);
            }
        }
    }
}

console.log("\n📦 Iniciando cópia de arquivos estáticos...\n");

if (fs.existsSync(src)) {
    console.log("📁 Copiando scripts...");
    copyJsRecursive(src, dest);
} else {
    console.log("⚠️  Pasta src/scripts não encontrada, pulando...");
}

if (fs.existsSync(srcPages)) {
    console.log("\n📁 Copiando pages...");
    copyJsRecursive(srcPages, destPages);
} else {
    console.log("⚠️  Pasta src/pages não encontrada, pulando...");
}

if (fs.existsSync(srcConfigs)) {
    console.log("\n📁 Copiando configs...");
    copyJsRecursive(srcConfigs, destConfigs);
} else {
    console.log("⚠️  Pasta src/configs não encontrada, pulando...");
}

if (fs.existsSync(gameSelectorSrc)) {
    console.log("\n📁 Copiando game-selector.html...");
    
    if (!fs.existsSync(destPages)) {
        fs.mkdirSync(destPages, { recursive: true });
    }
    
    fs.copyFileSync(gameSelectorSrc, gameSelectorDest);
    console.log(`✅ Copied: ${path.relative(__dirname, gameSelectorSrc)} -> ${path.relative(__dirname, gameSelectorDest)}`);
} else {
    console.log("⚠️  Arquivo src/game-selector.html não encontrado!");
}

console.log("\n✨ Cópia de arquivos estáticos concluída!\n");