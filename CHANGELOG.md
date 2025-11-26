# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-01-XX

### Adicionado

- **Launcher Desktop Completo**: Interface moderna e responsiva para seleção de jogos
- **Suporte a Bonk.io e Haxball**: Integração nativa dos dois jogos via BrowserView
- **Injeção DOM Segura**: Sistema de injeção de UI customizada nos jogos
- **Modal Interno**: Menu completo acessível dentro dos jogos com:
  - Configurações do launcher
  - Troca rápida entre jogos
  - Seção de apoio/donates
  - Informações sobre o projeto
- **Sistema de Auto-Update**: Atualizações automáticas via GitHub Releases
- **Build Multiplataforma**: Suporte para Windows, macOS e Linux
- **Arquitetura TypeScript**: Código 100% tipado e organizado
- **Segurança Avançada**: Context isolation, sandbox e CSP habilitados
- **Paleta Visual Laranja**: Design moderno com identidade visual consistente

### Segurança

- Context isolation habilitado em todos os processos
- Node integration desabilitado
- Sandbox mode ativado
- Content Security Policy configurado
- Validação de navegação externa

### Documentação

- README completo com instruções de uso
- Guia de contribuição (CONTRIBUTING.md)
- Guia de troubleshooting (TROUBLESHOOTING.md)
- Guia de deploy e CI/CD (DEPLOYMENT.md)
- Comentários JSDoc em todo o código

---

## [Unreleased]

### Planejado

- Suporte a mais jogos online
- Temas customizáveis (claro/escuro)
- Sistema de plugins
- Estatísticas de tempo de jogo
- Integração com Discord Rich Presence
- Modo offline para jogos que suportam
- Configurações avançadas de rede
- Suporte a múltiplas contas

---

## Tipos de Mudanças

- **Adicionado**: para novas funcionalidades
- **Modificado**: para mudanças em funcionalidades existentes
- **Descontinuado**: para funcionalidades que serão removidas
- **Removido**: para funcionalidades removidas
- **Corrigido**: para correções de bugs
- **Segurança**: para vulnerabilidades corrigidas
