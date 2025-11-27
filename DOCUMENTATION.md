# Game Launcher - Documentação Completa

## Visão Geral

O **Game Launcher** é uma aplicação desktop profissional desenvolvida em **Electron + TypeScript** que reúne dois jogos online populares: **Bonk.io** e **Haxball.com**. O launcher oferece uma interface moderna, sistema de auto-atualização automática e um modal integrado que permite aos usuários alternar entre jogos sem sair da aplicação.

## Arquitetura do Projeto

### Estrutura de Pastas

```
game-launcher/
├── electron/
│   ├── main/                    # Processo principal do Electron
│   │   └── index.ts            # Gerenciamento de janelas e BrowserViews
│   ├── preload/                # Bridge seguro entre processos
│   │   └── preload.ts          # API exposta ao renderer
│   ├── renderer/               # UI do renderer (React)
│   └── injector/               # Scripts injetados nos jogos
│       └── injector.ts         # Modal e UI injetada
├── client/                     # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Página inicial
│   │   │   └── GameLauncher.tsx # Componente principal do launcher
│   │   ├── types/
│   │   │   └── electron.ts     # Tipos da API Electron
│   │   └── App.tsx
│   └── public/
├── drizzle/                    # Schema do banco de dados
├── server/                     # Backend (Express + tRPC)
├── dist-electron/              # Output do build Electron
├── electron-builder.json       # Configuração do builder
├── vite.config.electron.ts     # Config Vite para Electron
├── tsconfig.electron.json      # Config TypeScript para Electron
└── package.json                # Dependências e scripts
```

### Componentes Principais

#### 1. **Processo Principal (Main)**
- Gerencia a janela principal da aplicação
- Cria e controla BrowserViews para cada jogo
- Implementa o sistema de auto-update
- Expõe APIs via IPC para o renderer

#### 2. **Preload Script**
- Bridge seguro entre o renderer e o main process
- Usa `contextIsolation` para máxima segurança
- Expõe apenas as funções necessárias via `contextBridge`

#### 3. **Injector (DOM Injection)**
- Script injetado no contexto dos jogos
- Cria o modal flutuante com interface profissional
- Implementa todas as abas (Configurações, Mudar Jogo, Donates, Sobre, Logs)
- Totalmente estilizado com Tailwind CSS

#### 4. **Frontend (React)**
- Página inicial com dois botões para os jogos
- Design moderno com paleta laranja
- Integração com a API do Electron via preload

## Funcionalidades

### 1. Interface Principal
- **Página Inicial**: Exibe dois cards com os jogos (Bonk.io e Haxball)
- **Design Responsivo**: Funciona em diferentes resoluções
- **Indicador de Versão**: Mostra versão atual e alerta de atualização
- **Animações Suaves**: Transições e efeitos visuais

### 2. Integração de Jogos
- **BrowserView Integrado**: Cada jogo é aberto em um BrowserView
- **Carregamento Não-Bloqueante**: UI responsiva durante o carregamento
- **Alternância de Jogos**: Trocar entre jogos sem fechar a aplicação

### 3. Modal Injetado
O modal é injetado automaticamente quando um jogo carrega. Oferece:

- **⚙️ Configurações**: Opções de auto-update, notificações e som
- **🎮 Mudar Jogo**: Alternar entre Bonk.io e Haxball
- **💝 Apoiar**: Opções de doação (Café, Pizza, Premium)
- **ℹ️ Sobre**: Informações sobre o projeto e recursos
- **📋 Logs**: Histórico de eventos da aplicação

### 4. Sistema de Auto-Update
- **Verificação Automática**: Verifica atualizações ao iniciar
- **Atualizações Silenciosas**: Baixa e instala em background
- **Aplicação no Próximo Boot**: Sem interrupção da experiência
- **Suporte a GitHub Releases**: Integração com repositório

### 5. Segurança
- **Context Isolation**: Isolamento entre processos
- **Sandbox Ativado**: Renderer rodando em sandbox
- **Preload Script**: Bridge seguro e controlado
- **Sem Node Integration**: Desabilitado por padrão

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- pnpm 10+
- Git

### Passos de Instalação

1. **Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/game-launcher.git
cd game-launcher
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

4. **Iniciar em desenvolvimento**
```bash
pnpm dev
```

## Scripts de Desenvolvimento

### Desenvolvimento

```bash
# Iniciar dev server com hot reload
pnpm dev

# Apenas frontend (React)
pnpm dev:frontend

# Apenas Electron
pnpm dev:electron
```

### Build e Empacotamento

```bash
# Build completo (frontend + Electron)
pnpm build

# Build apenas frontend
pnpm build:frontend

# Build apenas Electron
pnpm build:electron

# Empacotar aplicação (Windows, macOS, Linux)
pnpm pack

# Empacotar apenas para Windows
pnpm pack:win

# Empacotar apenas para macOS
pnpm pack:mac

# Empacotar apenas para Linux
pnpm pack:linux
```

### Testes e Validação

```bash
# Verificar tipos TypeScript
pnpm check

# Executar testes
pnpm test

# Lint e formatação
pnpm format
```

## Configuração do Auto-Update

### GitHub Releases

1. **Criar um repositório GitHub** para o projeto
2. **Configurar electron-builder.json**:
```json
{
  "publish": {
    "provider": "github",
    "owner": "seu-usuario",
    "repo": "game-launcher"
  }
}
```

3. **Gerar releases** no GitHub com tags semânticas (v1.0.0, v1.0.1, etc.)
4. **Fazer upload** dos arquivos compilados para cada release

### Servidor Personalizado

Para usar um servidor personalizado:

```json
{
  "publish": {
    "provider": "generic",
    "url": "https://seu-servidor.com/releases/"
  }
}
```

## Compilação e Publicação

### Preparar para Produção

1. **Atualizar versão** em `package.json`
2. **Compilar aplicação**:
```bash
pnpm build
```

3. **Empacotar**:
```bash
pnpm pack
```

4. **Gerar release no GitHub**:
```bash
gh release create v1.0.0 dist-electron/* --title "Game Launcher v1.0.0"
```

### Assinatura de Código (Opcional)

Para Windows (MSIX):
```bash
# Configurar certificado em electron-builder.json
{
  "win": {
    "certificateFile": "caminho/para/certificado.pfx",
    "certificatePassword": "sua-senha"
  }
}
```

Para macOS:
```bash
# Configurar certificado Apple Developer
# Definir variáveis de ambiente:
# CSC_LINK=caminho/para/certificado.p12
# CSC_KEY_PASSWORD=sua-senha
```

## Estrutura de Dados

### Banco de Dados (Drizzle ORM)

O projeto usa MySQL/TiDB com Drizzle ORM. Schema atual:

```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

### Migrations

```bash
# Gerar migration
pnpm db:push

# Aplicar migrations
pnpm db:migrate
```

## API do Electron

### Funções Disponíveis

```typescript
// Abrir um jogo
await window.electronAPI.openGame("bonk" | "haxball");

// Fechar jogo atual
await window.electronAPI.closeGame();

// Obter jogo atual
const { game } = await window.electronAPI.getCurrentGame();

// Verificar atualizações
const { hasUpdate } = await window.electronAPI.checkForUpdates();

// Obter versão
const { version } = await window.electronAPI.getAppVersion();

// Listeners de atualização
window.electronAPI.onUpdateAvailable(() => {
  console.log("Atualização disponível");
});

window.electronAPI.onUpdateInstalled(() => {
  console.log("Atualização instalada");
});
```

## Injeção de DOM

### Como Funciona

1. Quando um jogo é aberto em um BrowserView, o script `injector.ts` é injetado
2. O injector cria um botão flutuante (FAB) no canto inferior direito
3. Ao clicar, abre um modal com todas as funcionalidades
4. O modal é totalmente estilizado e responsivo

### Customização

Para customizar o injector:

1. Editar `electron/injector/injector.ts`
2. Modificar estilos CSS (cores, tamanhos, animações)
3. Adicionar novas abas ou funcionalidades
4. Recompilar: `pnpm build:electron`

## Troubleshooting

### Problema: Modal não aparece no jogo

**Solução**: Verificar se o script de injeção está sendo executado
```typescript
// Adicionar logs no injector
console.log("Injector iniciado");
```

### Problema: Auto-update não funciona

**Solução**: Verificar configuração do electron-builder.json e GitHub releases

### Problema: Aplicação não inicia em produção

**Solução**: Verificar logs em `%APPDATA%\Game Launcher\logs` (Windows) ou `~/Library/Logs/Game Launcher` (macOS)

## Performance

### Otimizações Implementadas

- **Lazy Loading**: BrowserViews carregam sob demanda
- **Code Splitting**: Frontend dividido em chunks
- **Minification**: Build otimizado com Terser
- **Caching**: Recursos estáticos com cache agressivo

### Monitoramento

```bash
# Verificar tamanho do bundle
pnpm analyze

# Perfil de performance
# Usar DevTools do Electron (F12)
```

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

## Roadmap

- [ ] Suporte a mais jogos
- [ ] Sistema de plugins
- [ ] Customização de tema
- [ ] Integração com Discord
- [ ] Sistema de achievements
- [ ] Multiplayer integrado
- [ ] Streaming integrado

## Changelog

### v1.0.0 (2024)
- ✅ Release inicial
- ✅ Suporte a Bonk.io e Haxball
- ✅ Modal injetado
- ✅ Sistema de auto-update
- ✅ Interface moderna

---

**Desenvolvido com ❤️ usando Electron + TypeScript**
