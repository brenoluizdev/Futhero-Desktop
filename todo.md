# Game Launcher - TODO

## Fase 1: Estrutura Base do Electron + TypeScript
- [x] Configurar estrutura de pastas (main, preload, renderer, injector)
- [x] Instalar dependências: electron, electron-builder, electron-updater, typescript
- [x] Criar arquivo main.ts (processo principal)
- [x] Criar arquivo preload.ts (bridge seguro)
- [x] Configurar webpack/esbuild para build
- [x] Configurar contextIsolation e sandbox

## Fase 2: Interface Principal (UI)
- [x] Criar página inicial (Home) com dois botões de jogo
- [x] Implementar design com paleta laranja
- [x] Criar navegação entre jogos (Bonk.io ↔ Haxball)
- [x] Adicionar animações suaves
- [x] Implementar responsividade

## Fase 3: Integração de Jogos
- [x] Criar BrowserView para Bonk.io
- [x] Criar BrowserView para Haxball.com
- [x] Implementar carregamento não-bloqueante
- [x] Testar performance de abertura

## Fase 4: Modal Injetado (UI Injected)
- [x] Criar script de injeção DOM (injector.ts)
- [x] Implementar botão/menu no canto inferior direito
- [x] Criar modal com layout profissional
- [x] Implementar seções: Configurações, Alternar Jogo, Donates, Sobre
- [x] Adicionar animações ao modal
- [x] Garantir segurança com contextIsolation

## Fase 5: Funcionalidades do Modal
- [x] Implementar Configurações do Launcher
- [x] Implementar alternância entre jogos
- [x] Criar seção Donates/Apoio
- [x] Criar seção Sobre o Projeto
- [x] Adicionar logs/ferramentas extras

## Fase 6: Sistema de Auto-Update
- [x] Configurar electron-updater
- [x] Integrar com GitHub Releases
- [x] Implementar atualizações silenciosas
- [x] Implementar atualizações incrementais
- [x] Testar aplicação no próximo boot

## Fase 7: Build e Empacotamento
- [x] Configurar electron-builder
- [x] Criar scripts de build (dev, prod)
- [x] Configurar assinatura de código
- [x] Testar empacotamento para Windows/macOS/Linux
- [x] Gerar instaladores

## Fase 8: Documentação
- [x] Documentar arquitetura do projeto
- [x] Criar guia de desenvolvimento
- [x] Criar guia de build e compilação
- [x] Criar guia de publicação
- [x] Documentar sistema de auto-update

## Fase 9: Testes e Validação
- [x] Testar injeção de DOM
- [x] Testar segurança (contextIsolation)
- [x] Testar performance
- [x] Testar auto-update
- [x] Validar UI/UX

## Fase 10: Entrega Final
- [x] Criar checkpoint final
- [x] Preparar versão para publicação
- [x] Entregar projeto completo ao usuário
