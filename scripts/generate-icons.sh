#!/bin/bash

# Script para gerar ícones em diferentes formatos e tamanhos
# Requer: ImageMagick (convert)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/assets"
SVG_ICON="$ASSETS_DIR/icon.svg"

echo "🎨 Gerando ícones do Futhero Launcher..."

# Verificar se ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick não está instalado."
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    exit 1
fi

# Criar diretório de assets se não existir
mkdir -p "$ASSETS_DIR"

# Gerar PNG para Linux
echo "📦 Gerando icon.png (512x512)..."
convert -background none "$SVG_ICON" -resize 512x512 "$ASSETS_DIR/icon.png"

# Gerar ICO para Windows (múltiplos tamanhos)
echo "🪟 Gerando icon.ico (Windows)..."
convert -background none "$SVG_ICON" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 64x64 \) \
    \( -clone 0 -resize 128x128 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 "$ASSETS_DIR/icon.ico"

# Gerar ICNS para macOS (requer png2icns ou iconutil)
echo "🍎 Gerando icon.icns (macOS)..."

# Criar diretório temporário para iconset
ICONSET_DIR="$ASSETS_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# Gerar tamanhos necessários para macOS
for size in 16 32 64 128 256 512; do
    convert -background none "$SVG_ICON" -resize ${size}x${size} "$ICONSET_DIR/icon_${size}x${size}.png"
    convert -background none "$SVG_ICON" -resize $((size*2))x$((size*2)) "$ICONSET_DIR/icon_${size}x${size}@2x.png"
done

# Converter iconset para icns (macOS)
if command -v iconutil &> /dev/null; then
    iconutil -c icns "$ICONSET_DIR" -o "$ASSETS_DIR/icon.icns"
    echo "✅ icon.icns gerado com iconutil"
elif command -v png2icns &> /dev/null; then
    png2icns "$ASSETS_DIR/icon.icns" "$ICONSET_DIR"/*.png
    echo "✅ icon.icns gerado com png2icns"
else
    echo "⚠️  iconutil/png2icns não encontrado. icon.icns não foi gerado."
    echo "   macOS: iconutil já está disponível"
    echo "   Linux: sudo apt-get install icnsutils"
fi

# Limpar iconset temporário
rm -rf "$ICONSET_DIR"

echo "✅ Ícones gerados com sucesso!"
echo "   📁 $ASSETS_DIR/icon.png"
echo "   📁 $ASSETS_DIR/icon.ico"
if [ -f "$ASSETS_DIR/icon.icns" ]; then
    echo "   📁 $ASSETS_DIR/icon.icns"
fi
