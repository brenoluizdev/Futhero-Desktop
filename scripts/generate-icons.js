const fs = require('fs');
const path = require('path');

const dirs = ['build', 'build/appx'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const sourceIco = 'assets/images/icon.ico';
const destIco = 'build/icon.ico';

if (fs.existsSync(sourceIco)) {
  fs.copyFileSync(sourceIco, destIco);
  console.log('✓ icon.ico copiado para build/');
} else {
  console.error('✗ assets/images/icon.ico não encontrado!');
}