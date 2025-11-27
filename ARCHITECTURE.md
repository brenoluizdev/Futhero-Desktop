# Arquitetura do Game Launcher

## 📐 Visão Geral da Arquitetura

O Game Launcher é construído com uma arquitetura modular que separa claramente as responsabilidades entre os processos do Electron, frontend React e backend Express.

```
┌─────────────────────────────────────────────────────────────────┐
│                     APLICAÇÃO DESKTOP                           │
│                    (Game Launcher v1.0.0)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐ ┌──▼──────────┐ │
        │  MAIN PROCESS  │ │   RENDERER  │ │
        │   (Electron)   │ │   (React)   │ │
        └────────────────┘ └─────────────┘ │
                │                 │        │
        ┌───────▼─────────────────▼────┐   │
        │    PRELOAD SCRIPT (Bridge)    │   │
        │  (contextBridge + IPC)        │   │
        └───────────────────────────────┘   │
                │                           │
        ┌───────▼──────────────────────┐   │
        │   BROWSER VIEWS (Jogos)      │   │
        │  ┌──────────┐  ┌──────────┐  │   │
        │  │ Bonk.io  │  │ Haxball  │  │   │
        │  └──────────┘  └──────────┘  │   │
        │       │              │        │   │
        │  ┌────▼──────────────▼────┐  │   │
        │  │  INJECTOR (Modal UI)   │  │   │
        │  │  - Settings            │  │   │
        │  │  - Game Switcher       │  │   │
        │  │  - Donate              │  │   │
        │  │  - About               │  │   │
        │  │  - Logs                │  │   │
        │  └────────────────────────┘  │   │
        └───────────────────────────────┘   │
                                            │
        ┌───────────────────────────────────▼──┐
        │      BACKEND (Express + tRPC)        │
        │  ┌────────────────────────────────┐  │
        │  │  Database (MySQL/TiDB)         │  │
        │  │  - Users                       │  │
        │  │  - Game Sessions               │  │
        │  │  - Update History              │  │
        │  └────────────────────────────────┘  │
        └────────────────────────────────────┘
```

## 🏗️ Componentes Principais

### 1. Main Process (electron/main/index.ts)

**Responsabilidades:**
- Gerenciar a janela principal da aplicação
- Criar e controlar BrowserViews para cada jogo
- Implementar IPC handlers para comunicação
- Gerenciar auto-updates
- Aplicar configurações de segurança

**Fluxo:**
```
App Start
    ↓
Create Main Window
    ↓
Load Renderer (React)
    ↓
Listen for IPC Events
    ↓
Handle Game Operations
    ↓
Manage Auto-Updates
```

### 2. Preload Script (electron/preload/preload.ts)

**Responsabilidades:**
- Expor API segura ao renderer via contextBridge
- Implementar IPC communication
- Validar tipos de entrada
- Garantir isolamento de contexto

**API Exposta:**
```typescript
window.electronAPI = {
  openGame(gameName: "bonk" | "haxball"),
  closeGame(),
  getCurrentGame(),
  checkForUpdates(),
  getAppVersion(),
  onUpdateAvailable(callback),
  onUpdateInstalled(callback),
  removeUpdateListener(channel)
}
```

### 3. Renderer (client/src/)

**Responsabilidades:**
- Renderizar interface principal
- Chamar APIs do Electron via preload
- Gerenciar estado da aplicação
- Exibir informações de versão e atualizações

**Componentes:**
- `GameLauncher.tsx` - Componente principal com cards dos jogos
- `Home.tsx` - Página inicial que renderiza GameLauncher
- `electron.ts` - Tipos TypeScript para a API

### 4. Injector (electron/injector/injector.ts)

**Responsabilidades:**
- Injetar modal no contexto dos jogos
- Criar interface flutuante (FAB)
- Implementar abas do modal
- Gerenciar estado do modal
- Adicionar logs de eventos

**Estrutura do Modal:**
```
┌─────────────────────────────────────┐
│  Game Launcher Modal                │
├─────────────────────────────────────┤
│ ⚙️ Configurações | 🎮 Jogos | ...  │
├─────────────────────────────────────┤
│                                     │
│  Conteúdo da Aba Ativa              │
│  (Settings, Games, Donate, etc)     │
│                                     │
├─────────────────────────────────────┤
│ [Fechar]                            │
└─────────────────────────────────────┘

Botão Flutuante (FAB):
┌───┐
│ ⚙️ │  (Canto inferior direito)
└───┘
```

### 5. Backend (server/)

**Responsabilidades:**
- Gerenciar banco de dados
- Implementar tRPC procedures
- Autenticação via OAuth
- Notificações ao owner

**Endpoints principais:**
- `auth.me` - Obter usuário atual
- `auth.logout` - Fazer logout
- `system.notifyOwner` - Notificar owner

## 🔄 Fluxos de Dados

### Fluxo 1: Abrir um Jogo

```
Usuário clica "Jogar Bonk.io"
    ↓
React chama window.electronAPI.openGame("bonk")
    ↓
Preload envia IPC: "open-game" com "bonk"
    ↓
Main Process recebe IPC
    ↓
Cria novo BrowserView
    ↓
Carrega https://bonk.io
    ↓
Injeta script do modal
    ↓
Modal aparece no jogo
```

### Fluxo 2: Verificar Atualizações

```
App Inicia
    ↓
Main Process inicia electron-updater
    ↓
Verifica GitHub Releases
    ↓
Se houver versão mais nova:
    ↓
    Download em background
    ↓
    Notifica usuário (opcional)
    ↓
    No próximo boot: Aplica atualização
```

### Fluxo 3: Mudar de Jogo

```
Usuário clica "Mudar Jogo" no modal
    ↓
Seleciona novo jogo
    ↓
Modal envia evento ao Electron
    ↓
Main Process fecha BrowserView anterior
    ↓
Cria novo BrowserView
    ↓
Carrega novo jogo
    ↓
Injeta modal novamente
```

## 🔐 Arquitetura de Segurança

### Camadas de Isolamento

```
┌────────────────────────────────────┐
│  Renderer Process (Sandbox)        │
│  - Sem acesso a Node.js            │
│  - Sem acesso ao filesystem        │
│  - Sem acesso a processos          │
└────────────────┬───────────────────┘
                 │
        ┌────────▼────────┐
        │  Preload Script │
        │  (Bridge)       │
        │  - contextBridge│
        │  - Validação    │
        └────────┬────────┘
                 │
┌────────────────▼───────────────────┐
│  Main Process (Trusted)            │
│  - Acesso a Node.js                │
│  - Acesso ao filesystem            │
│  - Controle total                  │
└────────────────────────────────────┘
```

### Validações de Segurança

1. **Context Isolation**: `contextIsolation: true`
   - Renderer não pode acessar Node.js
   - Preload atua como bridge

2. **Sandbox**: `sandbox: true`
   - Renderer roda em sandbox
   - Acesso limitado ao sistema

3. **Node Integration**: `nodeIntegration: false`
   - Desabilitado por padrão
   - Renderer não pode usar require()

4. **Validação de Entrada**:
   - Tipos TypeScript
   - Validação em preload
   - Sanitização de dados

## 📊 Estrutura de Dados

### Banco de Dados

```sql
-- Usuários
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);

-- Possíveis extensões futuras:
-- game_sessions (histórico de jogos)
-- update_history (histórico de atualizações)
-- donations (histórico de doações)
```

## 🔄 Ciclo de Vida da Aplicação

```
┌─────────────────────────────────────┐
│  1. Inicialização                   │
│  - Criar Main Window                │
│  - Carregar Renderer (React)        │
│  - Verificar atualizações           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. Interface Principal             │
│  - Exibir cards dos jogos           │
│  - Mostrar versão e atualizações    │
│  - Aguardar interação do usuário    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  3. Jogo Aberto                     │
│  - Criar BrowserView                │
│  - Carregar jogo                    │
│  - Injetar modal                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. Interação com Modal             │
│  - Alternar abas                    │
│  - Mudar de jogo                    │
│  - Visualizar logs                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  5. Encerramento                    │
│  - Fechar BrowserView               │
│  - Limpar recursos                  │
│  - Aplicar atualizações (se houver) │
└─────────────────────────────────────┘
```

## 📦 Dependências Principais

| Pacote | Versão | Propósito |
|--------|--------|----------|
| electron | 39.2.4 | Framework desktop |
| electron-builder | 26.0.12 | Build e empacotamento |
| electron-updater | 6.6.2 | Auto-update |
| react | 19.1.1 | UI |
| typescript | 5.9.3 | Linguagem |
| vite | 7.1.7 | Build tool |
| tailwindcss | 4.1.14 | Estilos |
| drizzle-orm | 0.44.5 | ORM |
| trpc | 11.6.0 | RPC |

## 🚀 Performance

### Otimizações Implementadas

1. **Lazy Loading**: BrowserViews carregam sob demanda
2. **Code Splitting**: Frontend dividido em chunks
3. **Minification**: Build otimizado com Terser
4. **Caching**: Recursos estáticos com cache agressivo
5. **Non-blocking**: Injeção de DOM não bloqueia UI

### Métricas Esperadas

- Tempo de inicialização: < 2 segundos
- Tempo de abertura de jogo: < 3 segundos
- Tamanho do instalador: ~ 150-200 MB
- Uso de memória: ~ 200-300 MB

## 🔧 Configuração de Build

### Vite (Frontend)
```typescript
// vite.config.ts
- React 19 + JSX
- Tailwind CSS 4
- TypeScript strict mode
- Source maps em dev
```

### Vite Electron (Main Process)
```typescript
// vite.config.electron.ts
- ESNext target
- External: electron, fs, path, etc
- Minified com Terser
```

### electron-builder (Empacotamento)
```json
{
  "win": ["nsis", "portable"],
  "mac": ["dmg", "zip"],
  "linux": ["AppImage", "deb"],
  "publish": {
    "provider": "github"
  }
}
```

## 📈 Escalabilidade Futura

### Possíveis Extensões

1. **Mais Jogos**: Adicionar novos BrowserViews
2. **Sistema de Plugins**: Permitir extensões
3. **Customização de Tema**: Dark/Light mode
4. **Integração Discord**: Rich Presence
5. **Sistema de Achievements**: Gamificação
6. **Multiplayer Integrado**: Chat e amigos

### Arquitetura para Escalabilidade

- Componentes modulares e reutilizáveis
- Separação clara de responsabilidades
- Testes automatizados (23 testes)
- Documentação completa
- Type-safe com TypeScript

---

**Desenvolvido com ❤️ usando Electron + TypeScript**
