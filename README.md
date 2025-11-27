# 🎮 Futhero Launcher - Bonk.io & Haxball

Launcher desktop profissional e empresarial para os jogos Bonk.io e Haxball, construído com Electron + TypeScript.

## 📋 Características

- ✨ Interface moderna e responsiva com paleta laranja
- 🎮 Suporte para Bonk.io e Haxball
- 🔄 Sistema de auto-update automático
- 💉 Injeção DOM segura com menu flutuante
- 🎨 Modal profissional com animações suaves
- 🔒 Segurança com contextIsolation habilitado
- ⚡ Hot reload no desenvolvimento
- 📦 Build otimizado para produção

## 🏗️ Estrutura do Projeto

```
game-launcher/
├── src/
│   ├── main/
│   │   └── main.ts          # Processo principal do Electron
│   ├── preload/
│   │   ├── preload.ts       # Preload script principal
│   │   └── injector.ts      # Script de injeção DOM
│   └── renderer/
│       ├── index.html       # UI principal
│       ├── renderer.ts      # Lógica da interface
│       └── styles.css       # Estilos CSS
├── build/                   # Recursos para build
│   └── icon.ico            # Ícone do aplicativo
├── dist/                    # Código compilado
├── release/                 # Builds finais
├── package.json
├── tsconfig.main.json
└── webpack.renderer.config.js
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalar Dependências

```bash
npm install
```

### Criar Ícone

Coloque um arquivo `icon.ico` (Windows) ou `icon.icns` (macOS) na pasta `build/`.

## 💻 Desenvolvimento

### Executar em Modo Dev (com hot reload)

```bash
npm run dev
```

Isso irá:
1. Compilar o processo main
2. Iniciar o webpack-dev-server na porta 3001
3. Abrir o Electron com DevTools

### Build para Produção

```bash
npm run build
```

Compila todo o código TypeScript para JavaScript.

## 📦 Empacotamento

### Build Completo (Instalador)

```bash
npm run dist
```

Cria um instalador NSIS para Windows na pasta `release/`.

### Build Apenas Diretório

```bash
npm run pack
```

Útil para testar o aplicativo empacotado sem criar instalador.

## 🔄 Sistema de Auto-Update

### Configuração GitHub Releases

1. Crie um repositório no GitHub
2. Configure o `package.json`:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "seu-usuario",
    "repo": "game-launcher"
  }
}
```

3. Gere um token de acesso do GitHub
4. Configure a variável de ambiente:

```bash
export GH_TOKEN="seu_token_aqui"
```

5. Publique uma release:

```bash
npm run dist
```

6. Faça upload dos arquivos para GitHub Releases

### Como Funciona

- O launcher verifica atualizações ao iniciar
- Downloads são feitos em background
- Usuário é notificado quando a atualização está pronta
- Atualização é instalada automaticamente no próximo boot

## 🎨 Customização

### Cores e Paleta

As cores principais estão definidas em `src/renderer/styles.css`:

```css
/* Gradiente principal (laranja) */
background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);

/* Bordas e acentos */
border-color: rgba(255, 107, 53, 0.3);
```

### Adicionar Novos Jogos

1. Adicione a URL em `src/main/main.ts`:

```typescript
const GAME_URLS = {
  bonk: 'https://bonk.io',
  haxball: 'https://www.haxball.com',
  seujogo: 'https://seujogo.com'
};
```

2. Adicione o card em `src/renderer/index.html`
3. Atualize os tipos TypeScript

### Personalizar Menu Injetado

Edite `src/preload/injector.ts` para modificar:
- Posicionamento do botão
- Estilo do modal
- Seções e funcionalidades

## 🔒 Segurança

O projeto segue as melhores práticas de segurança do Electron:

- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ `sandbox: true`
- ✅ IPC seguro via contextBridge
- ✅ Validação de entradas

## 🐛 Debug

### Console do Main Process

```bash
npm run dev
# O console do terminal mostrará logs do main process
```

### DevTools do Renderer

As DevTools abrem automaticamente em modo dev. Para habilitar em produção:

```typescript
// Em src/main/main.ts
mainWindow.webContents.openDevTools();
```

### Inspecionar BrowserView (Jogo)

```typescript
// Em src/main/main.ts, adicione após criar gameView
gameView.webContents.openDevTools();
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Modo desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run pack` | Cria build sem instalador |
| `npm run dist` | Cria instalador completo |

## 🔧 Tecnologias Utilizadas

- **Electron**: Framework desktop
- **TypeScript**: Tipagem estática
- **Webpack**: Bundling do renderer
- **electron-builder**: Empacotamento
- **electron-updater**: Sistema de updates

## 📱 Plataformas Suportadas

Atualmente configurado para:
- ✅ Windows (NSIS installer)

Para adicionar outras plataformas, edite `package.json`:

```json
"build": {
  "mac": {
    "target": ["dmg", "zip"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -am 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto é fornecido como exemplo educacional.

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação do Electron
2. Consulte os logs de erro
3. Abra uma issue no GitHub

## 🎯 Próximos Passos

- [ ] Adicionar mais jogos
- [ ] Sistema de favoritos
- [ ] Histórico de partidas
- [ ] Integração com Discord Rich Presence
- [ ] Temas customizáveis
- [ ] Estatísticas de uso
- [ ] Suporte a múltiplos idiomas

---

**Desenvolvido com ❤️ usando Electron + TypeScript**