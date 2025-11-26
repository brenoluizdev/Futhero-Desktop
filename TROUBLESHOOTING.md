# Guia de Troubleshooting

Este guia ajuda a resolver problemas comuns ao desenvolver, compilar ou usar o Game Launcher.

## Problemas de Instalação

### Erro: "Cannot find module"

**Causa**: Dependências não foram instaladas corretamente.

**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
pnpm install
```

### Erro: "electron command not found"

**Causa**: Electron não foi instalado globalmente ou localmente.

**Solução**:
```bash
pnpm install electron --save-dev
```

## Problemas de Desenvolvimento

### Aplicativo não inicia com `pnpm dev`

**Possíveis causas e soluções**:

1. **TypeScript não compilou**:
   ```bash
   # Verificar erros de compilação
   pnpm run watch:ts
   ```

2. **Porta em uso**:
   ```bash
   # Matar processos Electron antigos
   pkill -f electron
   # ou no Windows:
   taskkill /F /IM electron.exe
   ```

3. **Arquivo `main.js` não existe**:
   ```bash
   # Compilar manualmente
   tsc
   ```

### Hot reload não funciona

**Causa**: O `concurrently` pode não estar sincronizando corretamente.

**Solução**:
```bash
# Executar em terminais separados
# Terminal 1:
pnpm run watch:ts

# Terminal 2:
pnpm run start:electron
```

### Erros de TypeScript

**Solução**:
```bash
# Verificar configuração
cat tsconfig.json

# Limpar e recompilar
rm -rf dist
tsc
```

## Problemas de Build

### Erro: "Application entry file not found"

**Causa**: O caminho do `main` no `package.json` está incorreto.

**Solução**:
Verifique se `package.json` tem:
```json
"main": "dist/main/main.js"
```

### Erro: "Icon file not found"

**Causa**: Ícones não foram gerados.

**Solução**:
```bash
# Instalar ImageMagick
# Ubuntu/Debian:
sudo apt-get install imagemagick

# macOS:
brew install imagemagick

# Gerar ícones
./scripts/generate-icons.sh
```

### Build falha no macOS (code signing)

**Causa**: Certificado de desenvolvedor não configurado.

**Solução temporária**:
Adicione no `electron-builder.yml`:
```yaml
mac:
  identity: null
```

### Build muito lento

**Solução**:
```bash
# Desabilitar compressão máxima temporariamente
# Edite electron-builder.yml:
compression: normal
```

## Problemas de Auto-Update

### Atualizações não são detectadas

**Possíveis causas**:

1. **Modo desenvolvimento ativo**:
   - Auto-update é desabilitado em `NODE_ENV=development`
   - Teste em build de produção

2. **Token GitHub não configurado**:
   ```bash
   export GH_TOKEN="seu_token_aqui"
   ```

3. **Release não publicado**:
   - Verifique se o release no GitHub está publicado (não draft)

4. **Versão incorreta**:
   - A versão no `package.json` deve ser menor que a versão do release

### Erro: "Cannot download update"

**Solução**:
- Verifique sua conexão com a internet
- Confirme que os assets do release estão públicos
- Verifique se o repositório é público ou se o token tem permissões

## Problemas de Injeção DOM

### Botão do launcher não aparece no jogo

**Possíveis causas**:

1. **Preload não carregado**:
   - Verifique o caminho em `main.ts`:
     ```typescript
     preload: path.join(__dirname, '../preload/injector-preload.js')
     ```

2. **CSP do site bloqueia**:
   - Alguns sites têm Content Security Policy restritiva
   - Verifique o console do DevTools

3. **DOM não está pronto**:
   - O listener `DOMContentLoaded` pode não disparar
   - Tente usar `window.addEventListener('load', ...)`

### Modal não abre

**Solução**:
- Abra o DevTools do BrowserView (Ctrl+Shift+I)
- Verifique erros no console
- Confirme que os event listeners estão registrados

## Problemas de Performance

### Aplicativo lento ou travando

**Soluções**:

1. **Limpar cache**:
   ```bash
   # Localizar userData
   # Windows: %APPDATA%/game-launcher
   # macOS: ~/Library/Application Support/game-launcher
   # Linux: ~/.config/game-launcher
   
   # Deletar config.json e cache
   ```

2. **Reduzir uso de memória**:
   - Feche outros aplicativos
   - Reinicie o launcher

3. **Atualizar Electron**:
   ```bash
   pnpm update electron
   ```

### Jogo carrega lentamente

**Causa**: Conexão de internet ou servidor do jogo.

**Solução**:
- Verifique sua conexão
- Tente acessar o jogo diretamente no navegador
- Aguarde e tente novamente

## Problemas Específicos de Plataforma

### Windows: "Instalador não é confiável"

**Causa**: Aplicativo não assinado digitalmente.

**Solução para usuários**:
- Clique em "Mais informações" → "Executar mesmo assim"

**Solução para desenvolvedores**:
- Adquira um certificado de code signing

### macOS: "Aplicativo danificado"

**Causa**: Gatekeeper bloqueando aplicativo não assinado.

**Solução**:
```bash
xattr -cr /Applications/Game\ Launcher.app
```

### Linux: "Permissão negada"

**Solução**:
```bash
chmod +x Game-Launcher-*.AppImage
./Game-Launcher-*.AppImage
```

## Logs e Debugging

### Habilitar logs detalhados

Adicione ao início do `main.ts`:
```typescript
process.env.ELECTRON_ENABLE_LOGGING = 'true';
```

### Abrir DevTools automaticamente

No `main.ts`, após criar a janela:
```typescript
this.mainWindow.webContents.openDevTools();
```

### Localizar logs do aplicativo

- **Windows**: `%APPDATA%/game-launcher/logs`
- **macOS**: `~/Library/Logs/game-launcher`
- **Linux**: `~/.config/game-launcher/logs`

## Ainda com Problemas?

Se nenhuma solução acima funcionou:

1. **Abra uma issue** no GitHub com:
   - Descrição detalhada do problema
   - Sistema operacional e versão
   - Versão do Node.js (`node -v`)
   - Logs de erro completos
   - Passos para reproduzir

2. **Junte-se ao Discord** do projeto para suporte em tempo real

3. **Consulte a documentação** do Electron: https://www.electronjs.org/docs

---

**Dica**: Sempre mantenha suas dependências atualizadas com `pnpm update`.
