# Guia de Deploy e Publicação

Este documento descreve como fazer o deploy do Futhero Launcher e configurar pipelines de CI/CD para automação de builds e releases.

## Pré-requisitos

Antes de publicar uma nova versão, certifique-se de que:

- ✅ Todas as funcionalidades foram testadas
- ✅ Não há erros de compilação TypeScript
- ✅ O build local funciona em todas as plataformas alvo
- ✅ A versão no `package.json` foi incrementada
- ✅ O `CHANGELOG.md` foi atualizado (se aplicável)

## Publicação Manual

### 1. Preparar a Versão

Edite o `package.json` e incremente a versão seguindo [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Mudanças incompatíveis na API
- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades compatíveis
- **PATCH** (1.0.0 → 1.0.1): Correções de bugs

```json
{
  "version": "1.0.1"
}
```

### 2. Configurar Token do GitHub

O `electron-builder` precisa de um token de acesso do GitHub para publicar releases.

**Criar token**:
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione o escopo `repo`
4. Copie o token gerado

**Definir token**:
```bash
export GH_TOKEN="ghp_seu_token_aqui"
```

Para tornar permanente, adicione ao seu `.bashrc` ou `.zshrc`:
```bash
echo 'export GH_TOKEN="ghp_seu_token_aqui"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Fazer Commit e Tag

```bash
git add .
git commit -m "chore: Release v1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### 4. Executar Build e Publicar

**Para todas as plataformas** (requer macOS para builds do macOS):
```bash
pnpm build --publish always
```

**Para plataforma específica**:
```bash
# Windows
pnpm build:win --publish always

# macOS
pnpm build:mac --publish always

# Linux
pnpm build:linux --publish always
```

O `electron-builder` irá:
1. Compilar o TypeScript
2. Empacotar a aplicação
3. Criar instaladores
4. Fazer upload para GitHub Releases
5. Criar um draft do release

### 5. Publicar o Release

1. Acesse: `https://github.com/seu-usuario/game-launcher/releases`
2. Edite o draft criado
3. Adicione notas de release (changelog)
4. Clique em "Publish release"

Os usuários com o launcher instalado receberão a atualização automaticamente.

## CI/CD com GitHub Actions

Para automatizar o processo de build e publicação, configure GitHub Actions.

### Configuração

Crie o arquivo `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Generate icons (Linux only)
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y imagemagick icnsutils
          ./scripts/generate-icons.sh
      
      - name: Build and publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: pnpm build --publish always
```

### Configurar Secrets

O `GITHUB_TOKEN` é fornecido automaticamente pelo GitHub Actions. Certifique-se de que o repositório tem permissão para criar releases:

1. Vá em **Settings** → **Actions** → **General**
2. Em "Workflow permissions", selecione "Read and write permissions"
3. Salve as alterações

### Fluxo de Trabalho

Com CI/CD configurado, o processo se torna:

1. **Incremente a versão** no `package.json`
2. **Commit e push**:
   ```bash
   git add .
   git commit -m "chore: Release v1.0.1"
   git push
   ```
3. **Crie e push a tag**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. **Aguarde**: O GitHub Actions irá compilar para todas as plataformas automaticamente
5. **Publique**: Edite o draft do release e publique

## Distribuição Alternativa

### Servidor Próprio

Se preferir hospedar atualizações em seu próprio servidor, edite `electron-builder.yml`:

```yaml
publish:
  provider: generic
  url: https://seu-servidor.com/releases
```

Estrutura de diretórios no servidor:
```
/releases
├── latest.yml          # Metadados da última versão (Windows)
├── latest-mac.yml      # Metadados da última versão (macOS)
├── latest-linux.yml    # Metadados da última versão (Linux)
├── Game-Launcher-Setup-1.0.1.exe
├── Game-Launcher-1.0.1.dmg
└── Game-Launcher-1.0.1.AppImage
```

### Distribuição Direta

Para distribuir sem auto-update:

1. Compile os instaladores:
   ```bash
   pnpm build
   ```

2. Os arquivos estarão em `build/`:
   - Windows: `Game-Launcher-Setup-*.exe`
   - macOS: `Game-Launcher-*.dmg`
   - Linux: `Game-Launcher-*.AppImage` e `Game-Launcher-*.deb`

3. Distribua esses arquivos diretamente aos usuários

## Code Signing

Para evitar avisos de segurança, assine digitalmente os instaladores.

### Windows

1. Adquira um certificado de code signing
2. Configure no `electron-builder.yml`:
   ```yaml
   win:
     certificateFile: path/to/certificate.pfx
     certificatePassword: ${env.CERTIFICATE_PASSWORD}
   ```

### macOS

1. Inscreva-se no Apple Developer Program
2. Crie um certificado "Developer ID Application"
3. Configure:
   ```yaml
   mac:
     identity: "Developer ID Application: Seu Nome (TEAM_ID)"
   ```

### Linux

Linux geralmente não requer assinatura, mas você pode assinar pacotes `.deb`:

```bash
dpkg-sig --sign builder Game-Launcher-*.deb
```

## Monitoramento de Releases

### Estatísticas de Download

Use a API do GitHub para monitorar downloads:

```bash
curl -H "Authorization: token $GH_TOKEN" \
  https://api.github.com/repos/seu-usuario/game-launcher/releases/latest
```

### Telemetria de Atualizações

Para rastrear quantos usuários atualizaram, adicione analytics no `main.ts`:

```typescript
autoUpdater.on('update-downloaded', () => {
  // Enviar evento para seu serviço de analytics
  analytics.track('update_downloaded', { version: info.version });
});
```

## Rollback

Se uma versão tiver problemas críticos:

1. **Despublique o release** no GitHub
2. **Publique uma versão corrigida** com versão incrementada
3. **Notifique os usuários** através dos canais de comunicação

**Importante**: Não delete releases antigas, pois usuários podem estar usando versões intermediárias.

## Checklist de Release

Antes de publicar:

- [ ] Versão incrementada no `package.json`
- [ ] Changelog atualizado
- [ ] Testes passando
- [ ] Build local funciona
- [ ] Token do GitHub configurado
- [ ] Tag criada e pushed
- [ ] Notas de release preparadas
- [ ] Ícones gerados
- [ ] Code signing configurado (opcional)

---

**Dica**: Mantenha um `CHANGELOG.md` atualizado para facilitar a criação de notas de release.
