# Arquitetura da Futhero Launcher

Este documento descreve a arquitetura técnica do Futhero Launcher, explicando como os diferentes componentes interagem e as decisões de design tomadas.

## Visão Geral

O Futhero Launcher é construído sobre o **Electron**, que combina Chromium (para renderização) e Node.js (para acesso ao sistema). A arquitetura segue o padrão de **múltiplos processos** do Electron, garantindo isolamento, segurança e performance.

### Diagrama de Processos

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process (Node.js)               │
│  - Gerencia ciclo de vida da aplicação                 │
│  - Cria e controla janelas                             │
│  - Gerencia BrowserView para jogos                     │
│  - Sistema de auto-update                              │
│  - Persistência de configurações                       │
│  - Comunicação IPC                                     │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               │ IPC                  │ IPC
               │                      │
       ┌───────▼─────────┐    ┌──────▼──────────────────┐
       │  Preload Script │    │  Injector Preload Script│
       │  (Context Bridge)│    │  (Context Bridge)       │
       └───────┬─────────┘    └──────┬──────────────────┘
               │                      │
               │                      │
       ┌───────▼─────────┐    ┌──────▼──────────────────┐
       │ Renderer Process│    │  BrowserView (Jogo)     │
       │  (Launcher UI)  │    │  + UI Injetada          │
       │  - HTML/CSS/JS  │    │  - Página do jogo       │
       │  - Interface    │    │  - Modal customizado    │
       └─────────────────┘    └─────────────────────────┘
```

## Componentes Principais

### 1. Main Process (`src/main/`)

O processo principal é o coração da aplicação. Ele roda em Node.js e tem acesso completo ao sistema operacional.

#### `main.ts`

Responsabilidades:
- Inicializar a aplicação Electron
- Criar e gerenciar a janela principal (`BrowserWindow`)
- Criar e gerenciar o `BrowserView` para os jogos
- Configurar handlers IPC para comunicação com os processos de renderização
- Integrar o sistema de auto-update (`electron-updater`)
- Aplicar políticas de segurança

Fluxo de inicialização:
1. App inicia → `onReady()` é chamado
2. Cria `BrowserWindow` com configurações de segurança
3. Carrega a página inicial do launcher (`index.html`)
4. Configura IPC handlers
5. Inicia verificação de atualizações (após 3 segundos)

#### `config-manager.ts`

Gerencia a persistência de configurações do usuário.

- **Localização**: `app.getPath('userData')/config.json`
- **Formato**: JSON
- **Conteúdo**: Jogo atual, preferências de auto-update, tema

Métodos:
- `loadConfig()`: Carrega configurações do disco
- `saveConfig()`: Salva configurações no disco
- `getConfig()`: Retorna cópia das configurações
- `setConfig()`: Atualiza configurações parcialmente

#### `game-manager.ts`

Centraliza informações sobre os jogos disponíveis.

Estrutura de dados:
```typescript
Map<GameType, GameConfig> {
  'bonk' => { name: 'Bonk.io', url: 'https://bonk.io', type: 'bonk' },
  'haxball' => { name: 'Haxball', url: 'https://www.haxball.com', type: 'haxball' }
}
```

Facilita a adição de novos jogos no futuro.

### 2. Preload Scripts (`src/preload/`)

Os preload scripts são executados antes do código do renderer e têm acesso tanto ao Node.js quanto ao DOM. Eles são a **ponte segura** entre o main process e o renderer process.

#### `preload.ts`

Expõe API segura para a interface do launcher via `contextBridge`.

API exposta (`window.electronAPI`):
- `launchGame(game)`: Lança um jogo
- `closeGame()`: Fecha o jogo atual
- `switchGame(game)`: Troca de jogo
- `getConfig()`: Obtém configurações
- `setConfig(config)`: Atualiza configurações
- `checkUpdates()`: Verifica atualizações manualmente
- `quitApp()`: Fecha a aplicação
- `onUpdateAvailable(callback)`: Listener para atualizações disponíveis
- `onUpdateDownloaded(callback)`: Listener para atualizações baixadas
- `onUpdateError(callback)`: Listener para erros de atualização

**Segurança**: Usa `contextBridge.exposeInMainWorld()` para expor apenas métodos específicos, sem expor o `ipcRenderer` diretamente.

#### `injector-preload.ts`

Responsável por injetar a UI customizada (botão e modal) dentro da página do jogo.

Processo de injeção:
1. Aguarda o evento `DOMContentLoaded`
2. Cria elementos DOM (botão flutuante e modal)
3. Injeta estilos CSS inline
4. Configura event listeners
5. Expõe API para comunicação com o main process

**Segurança**: Também usa `contextBridge` e `contextIsolation` para garantir que o código injetado não tenha acesso ao Node.js.

### 3. Renderer Process (`src/renderer/`)

O processo de renderização é responsável pela interface visual do launcher. Roda em um contexto de navegador (Chromium) sem acesso direto ao Node.js.

#### `index.html`

Estrutura da página:
- **Header**: Logo e botão de verificar atualizações
- **Main Content**: Cards dos jogos (Bonk.io e Haxball)
- **Footer**: Versão e status de atualização
- **Notification**: Toast para notificações de atualização

**Content Security Policy**: Configurado para permitir apenas recursos locais, aumentando a segurança.

#### `styles.css`

Design system:
- **Paleta de cores**: Tons de laranja (`#FF6B35`, `#F7931E`, `#FFA500`)
- **Tema escuro**: Background gradiente de preto
- **Componentes**: Cards, botões, notificações
- **Animações**: Transições suaves, hover effects, slide-in
- **Responsividade**: Grid adaptativo para diferentes tamanhos de tela

#### `renderer.ts`

Lógica da interface:
- Event listeners para botões de jogar
- Gerenciamento de notificações
- Atualização de status na UI
- Comunicação com o main process via `window.electronAPI`

### 4. Injector (`src/injector/`)

Embora não seja um diretório separado no código final (está dentro do `injector-preload.ts`), a lógica do injector é conceitualmente um componente distinto.

#### Botão Flutuante

- **Posição**: Canto inferior direito (fixed)
- **Estilo**: Circular, gradiente laranja, sombra com glow
- **Interação**: Abre/fecha o modal

#### Modal Interno

Estrutura:
- **Overlay**: Fundo escuro com blur
- **Container**: Modal centralizado, 90% da tela
- **Header**: Título e botão de fechar
- **Navegação lateral**: Menu com ícones
- **Conteúdo**: Seções dinâmicas

Seções:
1. **Configurações**: Toggle de auto-update, seletor de tema, botão para fechar jogo
2. **Trocar Jogo**: Cards clicáveis para Bonk.io e Haxball
3. **Apoiar**: Botões para PayPal, PIX, Crypto
4. **Sobre**: Informações do projeto, versão, links

## Comunicação IPC

O Electron usa **Inter-Process Communication (IPC)** para permitir que os processos se comuniquem.

### Canais IPC

| Canal | Direção | Tipo | Descrição |
|-------|---------|------|-----------|
| `launch-game` | Renderer → Main | `invoke` | Lança um jogo |
| `close-game` | Renderer → Main | `invoke` | Fecha o jogo atual |
| `switch-game` | Renderer → Main | `invoke` | Troca de jogo |
| `get-config` | Renderer → Main | `invoke` | Obtém configurações |
| `set-config` | Renderer → Main | `invoke` | Atualiza configurações |
| `check-updates` | Renderer → Main | `invoke` | Verifica atualizações |
| `quit-app` | Renderer → Main | `send` | Fecha a aplicação |
| `toggle-modal` | Injector → Main | `send` | Ações do modal injetado |
| `update-available` | Main → Renderer | `send` | Notifica atualização disponível |
| `update-downloaded` | Main → Renderer | `send` | Notifica atualização baixada |
| `update-error` | Main → Renderer | `send` | Notifica erro de atualização |

### Padrões de Comunicação

**`invoke` / `handle`**: Para operações que retornam um resultado (request-response).

```typescript
// Renderer
const result = await window.electronAPI.launchGame('bonk');

// Main
ipcMain.handle('launch-game', async (event, gameType) => {
  // ...
  return { success: true };
});
```

**`send` / `on`**: Para eventos unidirecionais (fire-and-forget).

```typescript
// Renderer
window.electronAPI.quitApp();

// Main
ipcMain.on('quit-app', () => {
  app.quit();
});
```

## Sistema de Auto-Update

O sistema de auto-update usa o `electron-updater`, que se integra com GitHub Releases.

### Fluxo de Atualização

1. **Verificação**: A cada 3 segundos após o app iniciar, ou manualmente
2. **Detecção**: `autoUpdater.checkForUpdates()` consulta o GitHub
3. **Comparação**: Compara a versão local com a versão mais recente no GitHub
4. **Download**: Se houver atualização, baixa automaticamente em background
5. **Notificação**: Informa o usuário via IPC
6. **Instalação**: Atualização é aplicada quando o app é fechado

### Eventos do Auto-Updater

```typescript
autoUpdater.on('update-available', (info) => {
  // Nova versão encontrada
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  // Download completo
  mainWindow.webContents.send('update-downloaded', info);
});

autoUpdater.on('error', (error) => {
  // Erro durante o processo
  mainWindow.webContents.send('update-error', error);
});
```

### Configuração

No `electron-builder.yml`:
```yaml
publish:
  provider: github
  owner: seu-usuario
  repo: game-launcher
```

O `electron-updater` busca atualizações em:
```
https://api.github.com/repos/seu-usuario/game-launcher/releases/latest
```

## Segurança

A segurança é uma prioridade máxima. Seguimos as [melhores práticas do Electron](https://www.electronjs.org/docs/latest/tutorial/security).

### Configurações de Segurança

| Configuração | Valor | Razão |
|--------------|-------|-------|
| `contextIsolation` | `true` | Isola o contexto do preload do renderer |
| `nodeIntegration` | `false` | Impede acesso direto ao Node.js no renderer |
| `sandbox` | `true` | Executa o renderer em um sandbox do Chromium |
| `webSecurity` | `true` | Habilita políticas de segurança web (CORS, etc.) |
| `allowRunningInsecureContent` | `false` | Bloqueia conteúdo HTTP em páginas HTTPS |

### Content Security Policy (CSP)

No `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
```

Permite apenas:
- Scripts e estilos locais
- Estilos inline (necessário para alguns frameworks)

### Validação de Navegação

Previne que o renderer navegue para URLs externas:

```typescript
mainWindow.webContents.on('will-navigate', (event, url) => {
  event.preventDefault();
});
```

Links externos são abertos no navegador padrão:

```typescript
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: 'deny' };
});
```

## Performance

### Otimizações Implementadas

1. **Lazy Loading**: O jogo só é carregado quando o usuário clica em "Jogar"
2. **BrowserView**: Mais leve que criar uma nova `BrowserWindow`
3. **Injeção Assíncrona**: A UI injetada não bloqueia o carregamento do jogo
4. **Compressão**: `electron-builder` comprime os assets no build
5. **Transpilação**: TypeScript é compilado para JavaScript otimizado

### Uso de Memória

- **Launcher fechado**: ~150 MB
- **Jogo aberto**: +200-300 MB (dependendo do jogo)
- **Total**: ~400-500 MB

Comparável a ter o jogo aberto em uma aba do navegador.

## Extensibilidade

A arquitetura foi projetada para ser facilmente extensível.

### Adicionar Novo Jogo

1. Edite `game-manager.ts`:
   ```typescript
   [GameType.NOVO_JOGO, {
     name: 'Novo Jogo',
     url: 'https://novogame.com',
     type: GameType.NOVO_JOGO,
   }]
   ```

2. Adicione o tipo em `types.ts`:
   ```typescript
   export enum GameType {
     BONK = 'bonk',
     HAXBALL = 'haxball',
     NOVO_JOGO = 'novo_jogo',
   }
   ```

3. Adicione o card em `index.html`

### Adicionar Nova Seção no Modal

Edite `injector-preload.ts`:

1. Adicione o botão de navegação
2. Adicione a seção de conteúdo
3. Configure o event listener

### Adicionar Nova Configuração

1. Atualize a interface `LauncherConfig` em `types.ts`
2. Atualize o valor padrão em `config-manager.ts`
3. Adicione controles na UI (renderer ou modal)

## Decisões de Design

### Por que BrowserView em vez de WebView?

- **Performance**: `BrowserView` é mais leve e performático
- **Controle**: Melhor controle sobre o conteúdo
- **Segurança**: Mais fácil de configurar políticas de segurança
- **Modernidade**: `<webview>` está deprecated no Electron

### Por que TypeScript?

- **Tipagem forte**: Previne bugs em tempo de desenvolvimento
- **IntelliSense**: Melhor experiência de desenvolvimento
- **Manutenibilidade**: Código mais fácil de entender e manter
- **Escalabilidade**: Facilita refatoração e adição de features

### Por que electron-builder?

- **Multiplataforma**: Suporte nativo para Windows, macOS e Linux
- **Auto-update**: Integração perfeita com `electron-updater`
- **Configuração simples**: YAML declarativo
- **Comunidade**: Amplamente usado e bem mantido

## Limitações Conhecidas

1. **CSP dos Jogos**: Alguns jogos podem ter CSP restritiva que dificulta a injeção DOM
2. **Tamanho do App**: ~100-150 MB devido ao Chromium embarcado
3. **Memória**: Consome mais memória que uma aba do navegador devido ao overhead do Electron
4. **Code Signing**: Requer certificados pagos para evitar avisos de segurança

## Roadmap Técnico

### Curto Prazo

- Adicionar testes unitários (Jest)
- Implementar logging estruturado
- Adicionar telemetria opcional

### Médio Prazo

- Sistema de plugins
- Suporte a temas customizáveis
- Modo offline

### Longo Prazo

- Migrar para Electron Forge (alternativa ao electron-builder)
- Implementar multi-window para múltiplos jogos simultâneos
- Suporte a mods e extensões

---

**Este documento é mantido e atualizado pela equipe de desenvolvimento.**
