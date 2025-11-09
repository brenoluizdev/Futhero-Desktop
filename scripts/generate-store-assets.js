const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = 'build/appx';
const sourceImage = 'assets/images/icon.png';

const sizes = {
  'Square44x44Logo.png': { width: 44, height: 44 },
  'Square150x150Logo.png': { width: 150, height: 150 },
  'StoreLogo.png': { width: 50, height: 50 },
  'Wide310x150Logo.png': { width: 310, height: 150 },
  'Square310x310Logo.png': { width: 310, height: 310 }
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Object.entries(sizes).forEach(([filename, size]) => {
  sharp(sourceImage)
    .resize(size.width, size.height, {
      fit: 'contain',
      background: { r: 32, g: 32, b: 32, alpha: 1 }
    })
    .toFile(path.join(outputDir, filename))
    .then(() => console.log(`✓ ${filename} criado`))
    .catch(err => console.error(`✗ Erro ao criar ${filename}:`, err));
});