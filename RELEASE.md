# Como publicar uma nova release no GitHub

Este guia explica o passo a passo para criar uma nova versão do Futhero e publicá-la no GitHub, gerando automaticamente os instaladores para Windows, Linux e macOS.

---

## Pré-requisitos

- Git instalado e configurado
- Acesso de escrita ao repositório (push permitido)
- Branch `main` atualizada com as alterações que entram na release

---

## Passo 1: Atualizar a versão no `package.json`

Abra `package.json` e altere o campo **`version`** para a nova versão no formato **semver** (`MAJOR.MINOR.PATCH`):

```json
"version": "1.4.13"
```

- **MAJOR** (1.x.x): mudanças incompatíveis
- **MINOR** (x.4.x): novas funcionalidades compatíveis
- **PATCH** (x.x.13): correções de bugs

---

## Passo 2: Commitar a alteração de versão

```bash
git add package.json
git commit -m "chore: bump version to 1.4.13"
git push origin main
```

*(Substitua `1.4.13` pela versão que você definiu.)*

---

## Passo 3: Criar a tag localmente

A tag **precisa** seguir o padrão `vMAJOR.MINOR.PATCH` para o workflow de release ser acionado (ex.: `v1.4.13`).

```bash
git tag v1.4.13
```

Para incluir uma mensagem na tag (recomendado):

```bash
git tag -a v1.4.13 -m "Release 1.4.13"
```

**Importante:** tags no formato `v*.*.*-beta.*` (ex.: `v1.4.13-beta.1`) **não** disparam o workflow de release; use esse padrão para builds de teste.

---

## Passo 4: Enviar a tag para o GitHub

```bash
git push origin v1.4.13
```

Ou, se você criou várias tags e quer enviar todas de uma vez:

```bash
git push origin --tags
```

---

## Passo 5: O que acontece no GitHub

1. O **push da tag** dispara o workflow **"Build and Release"** (`.github/workflows/release.yml`).

2. O workflow executa **em paralelo**:
   - **build-windows** → gera instalador Windows (`.exe` + `.yml`)
   - **build-linux** → gera build Linux (ex.: `.AppImage`)
   - **build-mac** → gera build macOS (ex.: `.dmg`, `.zip`)

3. Depois que os três jobs terminam, o job **release**:
   - Baixa os artefatos de cada plataforma
   - Cria (ou atualiza) o **Release** no GitHub associado à tag
   - Anexa todos os arquivos gerados ao release

4. O release fica visível em:  
   **Repositório → Releases** (ou `https://github.com/brenoluizdev/Futhero-Desktop/releases`).

---

## Resumo dos comandos (exemplo para v1.4.13)

```bash
# 1. Atualizar version em package.json (ex.: "1.4.13")

# 2. Commitar e enviar
git add package.json
git commit -m "chore: bump version to 1.4.13"
git push origin main

# 3. Criar e publicar a tag
git tag -a v1.4.13 -m "Release 1.4.13"
git push origin v1.4.13
```

---

## Dicas

- **Conferir o workflow:** após o `git push` da tag, vá em **Actions** no GitHub e abra o workflow **"Build and Release"** para acompanhar o progresso e ver logs em caso de erro.

- **Tag errada:** se criou a tag localmente mas ainda não deu push, pode apagar e refazer:
  ```bash
  git tag -d v1.4.13
  git tag -a v1.4.13 -m "Release 1.4.13"
  ```
  Se já tiver enviado a tag ao GitHub, apague no remoto e recrie se necessário:
  ```bash
  git push origin --delete v1.4.13
  ```

- **Versão e tag:** mantenha a **tag** igual à **versão** do `package.json` (tag com `v` na frente: `v1.4.13` ↔ `"1.4.13"`).

- **Betas:** para não gerar release pública, use tags como `v1.4.14-beta.1`; o workflow atual ignora essas tags.
