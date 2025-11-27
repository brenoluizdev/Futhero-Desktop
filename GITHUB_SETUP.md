# Configuração do GitHub para Auto-Updates

Este guia descreve como configurar o GitHub para suportar auto-updates automáticos do Game Launcher.

## 📋 Pré-requisitos

- Repositório GitHub criado
- GitHub CLI instalado (`gh`)
- Permissões de administrador no repositório

## 🔧 Passos de Configuração

### 1. Criar Repositório GitHub

```bash
# Criar repositório (se ainda não existir)
gh repo create game-launcher --public --source=. --remote=origin --push
```

### 2. Gerar Token de Acesso Pessoal

1. Ir para https://github.com/settings/tokens
2. Clicar em "Generate new token" → "Generate new token (classic)"
3. Configurar permissões:
   - ✅ `repo` (acesso completo ao repositório)
   - ✅ `read:packages` (ler pacotes)
4. Copiar o token gerado

### 3. Configurar Variáveis de Ambiente

```bash
# Definir token para GitHub (opcional, para CI/CD)
export GH_TOKEN="seu_token_aqui"

# Ou adicionar ao .env (NÃO commitar!)
# GH_TOKEN=seu_token_aqui
```

### 4. Configurar electron-builder.json

O arquivo já está configurado para GitHub Releases:

```json
{
  "publish": {
    "provider": "github",
    "owner": "seu-usuario",
    "repo": "game-launcher",
    "releaseType": "release"
  }
}
```

**Atualizar `seu-usuario` com seu username do GitHub.**

## 🚀 Publicar uma Release

### Método 1: Usando GitHub CLI (Recomendado)

```bash
# 1. Atualizar versão
# Editar package.json: "version": "1.0.1"

# 2. Compilar
pnpm build

# 3. Empacotar
pnpm pack

# 4. Criar tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 5. Criar release com upload
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

### Método 2: Manualmente no GitHub

1. Ir para https://github.com/seu-usuario/game-launcher/releases
2. Clicar em "Draft a new release"
3. Selecionar tag: v1.0.1
4. Adicionar título e descrição
5. Fazer upload dos arquivos:
   - `dist-electron/Game Launcher 1.0.1.exe`
   - `dist-electron/Game Launcher 1.0.1 Portable.exe`
   - `dist-electron/Game Launcher-1.0.1.dmg`
   - `dist-electron/Game Launcher-1.0.1.zip`
   - `dist-electron/Game Launcher-1.0.1.AppImage`
   - `dist-electron/game-launcher-1.0.1.deb`
6. Publicar release

## 🔄 Como Funciona o Auto-Update

### Fluxo de Atualização

1. **Verificação**: Aplicação verifica GitHub Releases periodicamente
2. **Download**: Se houver versão mais nova, faz download em background
3. **Instalação**: Arquivo é extraído e preparado
4. **Aplicação**: No próximo boot, atualização é aplicada
5. **Notificação**: Usuário é notificado (opcional)

### Arquivo de Metadados

O electron-builder gera automaticamente `latest.yml`:

```yaml
version: 1.0.1
files:
  - url: Game Launcher-1.0.1.exe
    sha512: hash_do_arquivo
    size: tamanho_em_bytes
path: Game Launcher-1.0.1.exe
sha512: hash_do_arquivo
releaseDate: '2024-01-15T10:00:00.000Z'
```

Este arquivo é usado pelo updater para verificar versões.

## 🔐 Segurança

### Assinatura de Código (Opcional)

Para adicionar assinatura:

1. **Windows**: Obter certificado de assinatura
2. **macOS**: Usar certificado Apple Developer
3. **Linux**: Usar GPG (opcional)

### Verificação de Integridade

O electron-updater verifica automaticamente:
- ✅ Hash SHA-512 dos arquivos
- ✅ Assinatura digital (se configurada)
- ✅ Certificado SSL do servidor

## 🧪 Teste de Auto-Update

### Teste Local

1. **Compilar versão 1.0.0**:
```bash
# Editar package.json: "version": "1.0.0"
pnpm build && pnpm pack
```

2. **Instalar versão 1.0.0**

3. **Publicar versão 1.0.1** no GitHub

4. **Verificar atualização** na aplicação:
```typescript
// No console do Electron (F12)
await window.electronAPI.checkForUpdates();
```

5. **Reiniciar aplicação** para aplicar atualização

## 📊 Monitorar Releases

```bash
# Listar todas as releases
gh release list

# Ver detalhes de uma release
gh release view v1.0.1

# Deletar uma release (se necessário)
gh release delete v1.0.1
```

## 🐛 Troubleshooting

### Problema: "Release não encontrada"

**Solução**: Verificar se release foi publicada corretamente
```bash
gh release list
```

### Problema: "Arquivo não encontrado"

**Solução**: Verificar se todos os arquivos foram uploadados
```bash
gh release view v1.0.1
```

### Problema: "Auto-update não funciona"

**Solução**: Verificar logs
```
Windows: %APPDATA%\Game Launcher\logs
macOS: ~/Library/Logs/Game Launcher
Linux: ~/.config/Game Launcher/logs
```

### Problema: "Certificado inválido"

**Solução**: Verificar configuração de segurança em electron-builder.json

## 📚 Recursos Úteis

- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [GitHub CLI Docs](https://cli.github.com/)
- [Electron Builder Docs](https://www.electron.build/)
- [Electron Updater Docs](https://www.electron.build/auto-update)

## 🎯 Checklist de Publicação

- [ ] Versão atualizada em `package.json`
- [ ] CHANGELOG.md atualizado
- [ ] `pnpm build` executado com sucesso
- [ ] `pnpm pack` executado com sucesso
- [ ] Todos os arquivos gerados em `dist-electron/`
- [ ] Tag Git criada: `git tag -a v1.0.1`
- [ ] Tag enviada: `git push origin v1.0.1`
- [ ] Release criada no GitHub
- [ ] Todos os arquivos uploadados
- [ ] Release publicada
- [ ] Auto-update testado em versão anterior

---

**Desenvolvido com ❤️ usando Electron + TypeScript**
