# Guia de Build e Publicação - Game Launcher

Este guia detalha como compilar, empacotar e publicar o Game Launcher.

## 📋 Pré-requisitos

- Node.js 18+
- pnpm 10+
- Git
- Para Windows: Visual Studio Build Tools
- Para macOS: Xcode Command Line Tools
- Para Linux: build-essential

## 🔨 Processo de Build

### 1. Preparação

```bash
# Instalar dependências
pnpm install

# Verificar tipos TypeScript
pnpm check

# Executar testes
pnpm test
```

### 2. Build do Frontend

```bash
# Build da aplicação React
pnpm build:frontend

# Output: dist/
```

### 3. Build do Electron

```bash
# Build do processo principal e preload
pnpm build:electron

# Output: dist-electron/
```

### 4. Build Completo

```bash
# Build frontend + Electron
pnpm build

# Verifica se tudo foi compilado corretamente
ls -la dist/
ls -la dist-electron/
```

## 📦 Empacotamento

### Windows

```bash
# Empacotar para Windows (NSIS + Portable)
pnpm pack:win

# Output:
# dist-electron/Game Launcher 1.0.0.exe (Instalador)
# dist-electron/Game Launcher 1.0.0 Portable.exe (Portável)
```

**Requisitos adicionais:**
- Visual Studio Build Tools ou Visual Studio Community
- NSIS (instalado automaticamente pelo electron-builder)

### macOS

```bash
# Empacotar para macOS (DMG + ZIP)
pnpm pack:mac

# Output:
# dist-electron/Game Launcher-1.0.0.dmg (Instalador)
# dist-electron/Game Launcher-1.0.0.zip (Arquivo)
```

**Requisitos adicionais:**
- Xcode Command Line Tools: `xcode-select --install`
- Certificado Apple Developer (opcional, para assinatura)

### Linux

```bash
# Empacotar para Linux (AppImage + DEB)
pnpm pack:linux

# Output:
# dist-electron/Game Launcher-1.0.0.AppImage
# dist-electron/game-launcher-1.0.0.deb
```

**Requisitos adicionais:**
- build-essential: `sudo apt-get install build-essential`

### Todas as Plataformas

```bash
# Empacotar para todas as plataformas
pnpm pack

# Requer ferramentas de build para cada plataforma
```

## 🔑 Assinatura de Código

### Windows (Opcional)

Para assinar o executável, configure em `electron-builder.json`:

```json
{
  "win": {
    "certificateFile": "caminho/para/certificado.pfx",
    "certificatePassword": "sua-senha",
    "signingHashAlgorithms": ["sha256"]
  }
}
```

Ou use variáveis de ambiente:

```bash
export WIN_CSC_LINK="caminho/para/certificado.pfx"
export WIN_CSC_KEY_PASSWORD="sua-senha"
pnpm pack:win
```

### macOS (Recomendado)

```bash
# Configurar certificado
export CSC_LINK="caminho/para/certificado.p12"
export CSC_KEY_PASSWORD="sua-senha"
export APPLE_ID="seu-email@apple.com"
export APPLE_ID_PASSWORD="sua-senha-app-específica"
export APPLE_TEAM_ID="seu-team-id"

pnpm pack:mac
```

## 🚀 Publicação

### GitHub Releases

#### 1. Preparar Release

```bash
# Atualizar versão em package.json
# Exemplo: "version": "1.0.1"

# Compilar
pnpm build

# Empacotar
pnpm pack
```

#### 2. Criar Tag Git

```bash
# Criar tag com a versão
git tag -a v1.0.1 -m "Release v1.0.1"

# Push da tag
git push origin v1.0.1
```

#### 3. Criar Release no GitHub

Opção A: Usando GitHub CLI

```bash
# Criar release com upload de arquivos
gh release create v1.0.1 \
  dist-electron/Game\ Launcher\ 1.0.1.exe \
  dist-electron/Game\ Launcher\ 1.0.1\ Portable.exe \
  dist-electron/Game\ Launcher-1.0.1.dmg \
  dist-electron/Game\ Launcher-1.0.1.zip \
  dist-electron/Game\ Launcher-1.0.1.AppImage \
  dist-electron/game-launcher-1.0.1.deb \
  --title "Game Launcher v1.0.1" \
  --notes "Descrição das mudanças"
```

Opção B: Manualmente no GitHub

1. Ir para https://github.com/seu-usuario/game-launcher/releases
2. Clicar em "Draft a new release"
3. Selecionar tag: v1.0.1
4. Adicionar título e descrição
5. Fazer upload dos arquivos compilados
6. Publicar release

#### 4. Verificar Auto-Update

Após publicar a release, o auto-updater detectará automaticamente:

```typescript
// No aplicativo
const { hasUpdate } = await window.electronAPI.checkForUpdates();
```

### Servidor Personalizado

Para usar um servidor próprio:

1. **Configurar electron-builder.json**:
```json
{
  "publish": {
    "provider": "generic",
    "url": "https://seu-servidor.com/releases/"
  }
}
```

2. **Estrutura do servidor**:
```
seu-servidor.com/releases/
├── latest.yml
├── latest-mac.yml
├── latest-linux.yml
├── Game Launcher-1.0.1.exe
├── Game Launcher-1.0.1.dmg
└── Game Launcher-1.0.1.AppImage
```

3. **Gerar arquivo latest.yml**:
```bash
# electron-builder gera automaticamente após build
# Fazer upload para o servidor
```

## 📊 Checklist de Publicação

- [ ] Atualizar versão em `package.json`
- [ ] Atualizar CHANGELOG.md
- [ ] Executar `pnpm check` - sem erros
- [ ] Executar `pnpm test` - todos passando
- [ ] Executar `pnpm build` - sucesso
- [ ] Executar `pnpm pack` - arquivos gerados
- [ ] Testar instaladores localmente
- [ ] Criar tag Git
- [ ] Criar release no GitHub
- [ ] Fazer upload dos arquivos
- [ ] Testar auto-update em versão anterior
- [ ] Anunciar release

## 🧪 Teste de Auto-Update

### Teste Local

1. **Compilar versão 1.0.0**:
```bash
# Editar package.json: "version": "1.0.0"
pnpm build && pnpm pack
```

2. **Instalar versão 1.0.0**:
```bash
# Instalar o .exe, .dmg ou .AppImage
```

3. **Compilar versão 1.0.1**:
```bash
# Editar package.json: "version": "1.0.1"
pnpm build && pnpm pack
```

4. **Publicar versão 1.0.1** no GitHub

5. **Verificar atualização** na aplicação 1.0.0:
- Abrir aplicação
- Verificar se detecta atualização
- Aplicação deve atualizar no próximo boot

## 🐛 Troubleshooting

### Erro: "Cannot find module 'electron'"

```bash
pnpm install
pnpm build
```

### Erro: "Certificado não encontrado"

Verificar caminho do certificado em `electron-builder.json`

### Erro: "Build falhou no macOS"

```bash
# Instalar Xcode Command Line Tools
xcode-select --install

# Limpar cache
rm -rf dist-electron node_modules
pnpm install
pnpm build
```

### Erro: "Auto-update não funciona"

1. Verificar configuração do `electron-builder.json`
2. Verificar se release está publicada no GitHub
3. Verificar logs: `%APPDATA%\Game Launcher\logs`

## 📈 Versionamento

Usar Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

Exemplo: v1.2.3

## 📝 Changelog

Manter arquivo CHANGELOG.md atualizado:

```markdown
## [1.0.1] - 2024-01-15

### Added
- Novo recurso X

### Fixed
- Corrigido bug Y

### Changed
- Melhorado desempenho Z
```

## 🔗 Recursos Úteis

- [Electron Builder Docs](https://www.electron.build/)
- [Electron Updater Docs](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)

---

**Desenvolvido com ❤️ usando Electron + TypeScript**
