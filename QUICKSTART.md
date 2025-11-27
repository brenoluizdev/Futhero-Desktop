# Game Launcher - Guia Rápido de Início

Bem-vindo ao **Game Launcher**, um launcher desktop profissional para Bonk.io e Haxball desenvolvido com Electron e TypeScript.

## 🚀 Início Rápido (5 minutos)

### 1. Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/game-launcher.git
cd game-launcher

# Instalar dependências
pnpm install
```

### 2. Desenvolvimento

```bash
# Iniciar em modo desenvolvimento
pnpm dev

# Em outro terminal, iniciar Electron
pnpm dev:electron
```

### 3. Compilar

```bash
# Build completo
pnpm build

# Empacotar para sua plataforma
pnpm pack
```

## 📦 O que está Incluído

| Componente | Descrição |
|-----------|-----------|
| **Interface Principal** | Página inicial com dois cards para os jogos |
| **BrowserViews** | Integração de Bonk.io e Haxball dentro do launcher |
| **Modal Injetado** | Menu flutuante com 5 abas (Configurações, Jogos, Donates, Sobre, Logs) |
| **Auto-Update** | Sistema automático de atualização via GitHub Releases |
| **Segurança** | Context Isolation, Sandbox e Preload Script seguro |
| **Build Tools** | electron-builder para empacotamento multiplataforma |

## 📁 Estrutura do Projeto

```
electron/
├── main/        # Processo principal (gerencia janelas)
├── preload/     # Bridge seguro entre processos
└── injector/    # Scripts injetados nos jogos

client/
└── src/
    ├── pages/GameLauncher.tsx  # Componente principal
    └── types/electron.ts        # Tipos da API

server/
├── electron.test.ts            # Testes da API
└── auth.logout.test.ts          # Testes de autenticação

Arquivos de Configuração:
├── electron-builder.json        # Build e empacotamento
├── vite.config.electron.ts      # Config Vite para Electron
├── tsconfig.electron.json       # Config TypeScript
└── electron.config.ts           # Configurações principais
```

## 🎮 Funcionalidades Principais

### Interface Principal
- Design moderno com paleta laranja
- Dois cards para os jogos (Bonk.io e Haxball)
- Indicador de versão e atualizações
- Responsivo para diferentes resoluções

### Modal Injetado (Dentro do Jogo)
Pressione o botão ⚙️ no canto inferior direito:

- **⚙️ Configurações**: Auto-update, notificações, som
- **🎮 Mudar Jogo**: Alternar entre Bonk.io e Haxball
- **💝 Apoiar**: Opções de doação
- **ℹ️ Sobre**: Informações do projeto
- **📋 Logs**: Histórico de eventos

### Auto-Update
- Verifica atualizações automaticamente
- Download silencioso em background
- Aplicado no próximo boot
- Integrado com GitHub Releases

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
pnpm dev              # Iniciar dev server
pnpm dev:frontend     # Apenas frontend (React)
pnpm dev:electron     # Apenas Electron
```

### Build
```bash
pnpm build            # Build completo
pnpm build:frontend   # Build apenas frontend
pnpm build:electron   # Build apenas Electron
```

### Empacotamento
```bash
pnpm pack             # Empacotar para plataforma atual
pnpm pack:win         # Empacotar para Windows
pnpm pack:mac         # Empacotar para macOS
pnpm pack:linux       # Empacotar para Linux
pnpm pack:all         # Empacotar para todas as plataformas
```

### Testes e Validação
```bash
pnpm test             # Executar testes (23 testes)
pnpm check            # Verificar tipos TypeScript
pnpm format           # Formatar código
```

## 📚 Documentação Completa

Para documentação detalhada, consulte:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentação técnica completa
- **[README_ELECTRON.md](./README_ELECTRON.md)** - Guia específico do Electron
- **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** - Guia de build e publicação
- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - Configuração do GitHub para auto-updates

## 🚀 Publicação

### Passo 1: Preparar Release

```bash
# Atualizar versão em package.json
# Exemplo: "version": "1.0.1"

# Compilar
pnpm build

# Empacotar
pnpm pack
```

### Passo 2: Publicar no GitHub

```bash
# Criar tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# Criar release (usando GitHub CLI)
gh release create v1.0.1 dist-electron/* \
  --title "Game Launcher v1.0.1" \
  --notes "Descrição das mudanças"
```

### Passo 3: Verificar Auto-Update

- Instalar versão anterior (v1.0.0)
- Verificar se detecta atualização
- Atualização será aplicada no próximo boot

## 🔐 Segurança

O projeto implementa múltiplas camadas de segurança:

- ✅ **Context Isolation**: Isolamento entre processos
- ✅ **Sandbox**: Renderer rodando em sandbox
- ✅ **Preload Script**: Bridge controlado e seguro
- ✅ **Sem Node Integration**: Desabilitado por padrão
- ✅ **Validação de Entrada**: Tipos TypeScript e validação
- ✅ **HTTPS**: Todas as comunicações seguras

## 🧪 Testes

O projeto inclui 23 testes automatizados:

```bash
# Executar todos os testes
pnpm test

# Resultado esperado:
# ✓ server/electron.test.ts (22 tests)
# ✓ server/auth.logout.test.ts (1 test)
# Test Files: 2 passed (2)
# Tests: 23 passed (23)
```

Os testes cobrem:
- API do Electron
- Operações de jogo
- Sistema de atualização
- Segurança (contextIsolation)
- Estrutura do modal
- Injeção de DOM

## 🐛 Troubleshooting

### Problema: "Módulo não encontrado"
```bash
pnpm install
pnpm build
```

### Problema: "Aplicação não inicia"
```bash
# Limpar cache
rm -rf dist-electron node_modules
pnpm install
pnpm build
```

### Problema: "Auto-update não funciona"
- Verificar configuração em `electron-builder.json`
- Verificar se release está publicada no GitHub
- Consultar [GITHUB_SETUP.md](./GITHUB_SETUP.md)

## 📊 Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Electron | 39.2.4 | Framework desktop |
| TypeScript | 5.9.3 | Linguagem |
| React | 19.1.1 | UI |
| Tailwind CSS | 4.1.14 | Estilos |
| Vite | 7.1.7 | Build tool |
| electron-builder | 26.0.12 | Empacotamento |
| electron-updater | 6.6.2 | Auto-update |
| Vitest | 2.1.4 | Testes |

## 🎯 Próximos Passos

1. **Customizar**: Editar cores, textos e funcionalidades
2. **Testar**: Executar `pnpm test` para validar
3. **Compilar**: `pnpm build` para gerar binários
4. **Publicar**: Seguir guia em [BUILD_GUIDE.md](./BUILD_GUIDE.md)
5. **Monitorar**: Acompanhar downloads e feedback

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou consulte a documentação completa.

## 📄 Licença

MIT - veja LICENSE para detalhes

## 🎓 Recursos Úteis

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Builder Docs](https://www.electron.build/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Desenvolvido com ❤️ usando Electron + TypeScript**

**Versão**: 1.0.0 | **Última Atualização**: 2024
