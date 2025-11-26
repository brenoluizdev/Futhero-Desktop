_# Game Launcher Empresarial

![Game Launcher](assets/icon.png)

**Launcher desktop de nível empresarial para os jogos online Bonk.io e Haxball, desenvolvido com Electron, TypeScript e ferramentas modernas.**

---

## Visão Geral

O **Game Launcher** é uma aplicação desktop multiplataforma (Windows, macOS e Linux) que oferece uma experiência centralizada e aprimorada para jogar Bonk.io e Haxball. O projeto foi construído com foco em **performance, segurança e escalabilidade**, utilizando uma arquitetura moderna e robusta.

### Funcionalidades Principais

- **Interface Moderna**: UI leve e responsiva com uma paleta de cores laranja, seguindo a identidade visual do projeto.
- **Jogos Integrados**: Abre os jogos dentro de um `BrowserView` para uma experiência nativa e controlada.
- **Injeção DOM Segura**: Injeta um menu customizado nos jogos de forma segura, usando `preload` scripts e `contextIsolation`.
- **Modal Interno**: Um modal completo, acessível de dentro do jogo, com menus para configurações, troca de jogo, apoio e mais.
- **Auto-Update Silencioso**: Utiliza `electron-updater` para buscar e instalar atualizações automaticamente a partir de releases do GitHub.
- **Build Otimizado**: Configuração completa com `electron-builder` para gerar instaladores para Windows, macOS e Linux.
- **Código 100% TypeScript**: Todo o projeto é escrito em TypeScript, garantindo tipagem forte e manutenibilidade.

## Arquitetura do Projeto

O projeto é dividido em quatro diretórios principais dentro de `src/`, seguindo as melhores práticas de desenvolvimento com Electron:

```
/game-launcher
├── src
│   ├── main/         # Processo principal (Node.js)
│   ├── preload/      # Scripts de preload (ponte entre main e renderer/injector)
│   ├── renderer/     # UI do Launcher (HTML, CSS, TS)
│   └── injector/     # Lógica e UI injetada nos jogos (TS, CSS)
├── assets/           # Ícones e outros recursos visuais
├── scripts/          # Scripts de utilidade (ex: geração de ícones)
├── package.json      # Dependências e scripts
├── tsconfig.json     # Configuração do TypeScript
└── electron-builder.yml # Configuração do electron-builder
```

### Módulos

1.  **`main`**: Gerencia o ciclo de vida da aplicação, janelas (`BrowserWindow`), `BrowserView`, comunicação IPC, segurança e o sistema de auto-update.
2.  **`preload`**: Expõe APIs seguras do processo principal para os processos de renderização. Temos dois preloads:
    *   `preload.ts`: Para a janela principal do launcher.
    *   `injector-preload.ts`: Para o `BrowserView` onde o jogo é carregado, responsável por injetar a UI customizada.
3.  **`renderer`**: Responsável pela interface do launcher (a tela inicial de seleção de jogos). É uma página web padrão.
4.  **`injector`**: Contém o código (TypeScript e CSS) que é injetado na página do jogo. Este código cria o botão flutuante e o modal interno, comunicando-se com o processo `main` através do `injector-preload`.

## Como Começar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [pnpm](https://pnpm.io/) (ou npm/yarn)
- [Git](https://git-scm.com/)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/game-launcher.git
    cd game-launcher
    ```

2.  Instale as dependências:
    ```bash
    pnpm install
    ```

3.  Gere os ícones da aplicação (requer ImageMagick):
    ```bash
    ./scripts/generate-icons.sh
    ```

### Rodando em Modo de Desenvolvimento

Para iniciar o aplicativo em modo de desenvolvimento com hot-reload, execute:

```bash
pnpm dev
```

Este comando executa duas tarefas simultaneamente:
- `tsc -w`: Observa e transpila os arquivos TypeScript para JavaScript em tempo real.
- `wait-on dist/main/main.js && electron .`: Aguarda a compilação inicial do processo `main` e então inicia o Electron.

## Build e Empacotamento

O projeto utiliza `electron-builder` para criar instaladores otimizados para produção.

### Comandos de Build

- **Build para a plataforma atual**:
  ```bash
  pnpm build
  ```

- **Build para Windows**:
  ```bash
  pnpm build:win
  ```

- **Build para macOS**:
  ```bash
  pnpm build:mac
  ```

- **Build para Linux**:
  ```bash
  pnpm build:linux
  ```

Os arquivos de instalação serão gerados no diretório `build/`.

## Sistema de Auto-Update

O sistema de atualização automática é configurado para buscar novas versões a partir da seção **Releases** do repositório no GitHub.

### Configuração

1.  **`package.json`**: A chave `publish` define o provedor e o repositório.

    ```json
    "publish": {
      "provider": "github",
      "owner": "seu-usuario",
      "repo": "game-launcher"
    }
    ```

    **Importante**: Altere `seu-usuario` para o seu nome de usuário ou organização no GitHub.

2.  **Token de Acesso do GitHub**: Para publicar releases, o `electron-builder` precisa de um token de acesso do GitHub. Crie um token com o escopo `repo` e defina-o como uma variável de ambiente:

    ```bash
    export GH_TOKEN="seu_token_aqui"
    ```

### Publicando uma Nova Versão

1.  **Incremente a versão** no `package.json` (ex: de `1.0.0` para `1.0.1`).

2.  **Faça o commit** das suas alterações:
    ```bash
    git add .
    git commit -m "feat: Adiciona nova funcionalidade (v1.0.1)"
    git tag v1.0.1
    git push && git push --tags
    ```

3.  **Execute o build e publique**:
    ```bash
    pnpm build --publish always
    ```

O `electron-builder` irá compilar, criar os instaladores e fazer o upload deles para um novo rascunho de release no seu repositório GitHub. Basta editar e publicar o release para que os usuários comecem a receber a atualização automaticamente.

## Segurança

Seguimos as melhores práticas de segurança recomendadas pelo Electron:

- **`contextIsolation`**: Habilitado por padrão para todos os processos de renderização.
- **`nodeIntegration`**: Desabilitado.
- **`sandbox`**: Habilitado.
- **`webSecurity`**: Habilitado.
- **`Content-Security-Policy`**: Definido no HTML do renderer para restringir o carregamento de recursos.
- **Validação de Protocolos**: Links externos são abertos no navegador padrão do sistema (`shell.openExternal`) para maior segurança.

---

*Este projeto foi gerado e desenvolvido pela IA Manus.*
