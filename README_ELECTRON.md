# Game Launcher - Electron + TypeScript

Um launcher desktop profissional para os jogos **Bonk.io** e **Haxball.com**, desenvolvido com **Electron**, **TypeScript** e **React**.

## 🚀 Características

- ✅ Interface moderna com paleta laranja
- ✅ Suporte a múltiplos jogos (Bonk.io e Haxball)
- ✅ Modal injetado no jogo com menu flutuante
- ✅ Sistema de auto-atualização automática
- ✅ 100% seguro com Context Isolation
- ✅ Build otimizado com electron-builder
- ✅ TypeScript em todo o projeto
- ✅ Hot reload em desenvolvimento

## 📋 Pré-requisitos

- **Node.js** 18+
- **pnpm** 10+
- **Git**

## 🔧 Instalação Rápida

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/game-launcher.git
cd game-launcher

# 2. Instalar dependências
pnpm install

# 3. Iniciar em desenvolvimento
pnpm dev
```

## 📁 Estrutura do Projeto

```
electron/
├── main/          # Processo principal (gerencia janelas)
├── preload/       # Bridge seguro entre processos
├── renderer/      # UI do Electron
└── injector/      # Scripts injetados nos jogos

client/           # Frontend React
server/           # Backend Express + tRPC
```

## 🎮 Como Usar

### Desenvolvimento

```bash
# Iniciar com hot reload
pnpm dev

# Apenas verificar tipos
pnpm check

# Executar testes
pnpm test
```

### Build e Empacotamento

```bash
# Build completo
pnpm build

# Empacotar aplicação
pnpm pack

# Empacotar para Windows
pnpm pack:win

# Empacotar para macOS
pnpm pack:mac

# Empacotar para Linux
pnpm pack:linux
```

## 🎯 Funcionalidades Principais

### 1. Página Inicial
- Interface limpa e moderna
- Dois cards para os jogos
- Indicador de versão e atualizações
- Design responsivo

### 2. Modal Injetado
Quando um jogo está aberto, um botão ⚙️ aparece no canto inferior direito:

- **⚙️ Configurações**: Auto-update, notificações, som
- **🎮 Mudar Jogo**: Alternar entre Bonk.io e Haxball
- **💝 Apoiar**: Opções de doação
- **ℹ️ Sobre**: Informações do projeto
- **📋 Logs**: Histórico de eventos

### 3. Auto-Update
- Verifica atualizações automaticamente
- Download silencioso em background
- Aplicado no próximo boot
- Integrado com GitHub Releases

## 🔐 Segurança

- **Context Isolation**: Isolamento entre processos
- **Sandbox**: Renderer em sandbox
- **Preload Script**: Bridge controlado
- **Sem Node Integration**: Desabilitado por padrão

## 📦 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `electron/main/index.ts` | Processo principal e gerenciamento de janelas |
| `electron/preload/preload.ts` | API segura exposta ao renderer |
| `electron/injector/injector.ts` | Modal e UI injetada nos jogos |
| `client/src/pages/GameLauncher.tsx` | Componente principal da UI |
| `electron-builder.json` | Configuração de build e empacotamento |
| `vite.config.electron.ts` | Configuração do Vite para Electron |

## 🚢 Publicação

### GitHub Releases

1. Atualizar versão em `package.json`
2. Compilar: `pnpm build`
3. Empacotar: `pnpm pack`
4. Criar release no GitHub com os arquivos

### Configuração do electron-builder.json

```json
{
  "publish": {
    "provider": "github",
    "owner": "seu-usuario",
    "repo": "game-launcher"
  }
}
```

## 🐛 Troubleshooting

### Modal não aparece
- Verificar console (F12) para erros
- Confirmar que o injector está sendo injetado

### Auto-update não funciona
- Verificar configuração do GitHub
- Confirmar que releases estão publicadas

### Aplicação não inicia
- Verificar logs em `%APPDATA%\Game Launcher\logs`
- Limpar cache: `rm -rf dist-electron`

## 📚 Documentação Completa

Para documentação detalhada, veja [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT - veja LICENSE para detalhes

## 🎓 Stack Tecnológico

- **Electron** 39.2.4 - Framework desktop
- **TypeScript** 5.9.3 - Linguagem
- **React** 19.1.1 - UI
- **Tailwind CSS** 4.1.14 - Estilos
- **Vite** 7.1.7 - Build tool
- **electron-builder** 26.0.12 - Empacotamento
- **electron-updater** 6.6.2 - Auto-update

## 📞 Suporte

Para suporte, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ usando Electron + TypeScript**
