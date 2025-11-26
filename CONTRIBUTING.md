# Guia de Contribuição

Obrigado por considerar contribuir com o **Game Launcher**! Este documento fornece diretrizes para colaboradores.

## Como Contribuir

### Reportar Bugs

Se você encontrou um bug, por favor abra uma issue no GitHub com as seguintes informações:

- **Descrição clara do problema**
- **Passos para reproduzir**
- **Comportamento esperado vs. comportamento atual**
- **Sistema operacional e versão do launcher**
- **Logs ou screenshots, se aplicável**

### Sugerir Melhorias

Para sugerir novas funcionalidades ou melhorias:

1. Verifique se já não existe uma issue similar
2. Abra uma nova issue com a tag `enhancement`
3. Descreva claramente a funcionalidade e seus benefícios

### Enviar Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Faça suas alterações** seguindo os padrões do projeto
5. **Teste** suas alterações localmente
6. **Commit** suas mudanças com mensagens descritivas:
   ```bash
   git commit -m "feat: Adiciona funcionalidade X"
   ```
7. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
8. **Abra um Pull Request** no repositório original

## Padrões de Código

### TypeScript

- Use tipagem forte sempre que possível
- Evite `any` - prefira `unknown` quando necessário
- Documente funções públicas com JSDoc
- Siga as regras do `tsconfig.json`

### Estilo de Código

- **Indentação**: 2 espaços
- **Aspas**: Simples (`'`) para strings
- **Ponto e vírgula**: Obrigatório
- **Naming**:
  - Classes: `PascalCase`
  - Funções/variáveis: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Arquivos: `kebab-case.ts`

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `style:` Formatação, ponto e vírgula, etc.
- `refactor:` Refatoração de código
- `test:` Adição ou modificação de testes
- `chore:` Tarefas de manutenção

## Estrutura do Projeto

Antes de contribuir, familiarize-se com a estrutura:

```
src/
├── main/       # Processo principal do Electron
├── preload/    # Scripts de preload (ponte segura)
├── renderer/   # Interface do launcher
└── injector/   # UI injetada nos jogos
```

## Testando Localmente

Antes de enviar um PR, certifique-se de que:

1. O código compila sem erros:
   ```bash
   pnpm build
   ```

2. O aplicativo funciona em modo dev:
   ```bash
   pnpm dev
   ```

3. Os builds são gerados corretamente:
   ```bash
   pnpm build:win  # ou build:mac, build:linux
   ```

## Código de Conduta

- Seja respeitoso e profissional
- Aceite feedback construtivo
- Foque no que é melhor para o projeto
- Ajude outros contribuidores quando possível

## Dúvidas?

Se tiver dúvidas sobre como contribuir, sinta-se à vontade para:

- Abrir uma issue com a tag `question`
- Entrar em contato através do Discord do projeto
- Consultar a documentação no README.md

---

**Obrigado por contribuir com a Futhero!** 🎮
