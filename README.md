# IEOP — Índice de Eficiência de Obras Públicas (Macaé/RJ)

Dashboard analítico de eficiência de obras públicas no município de Macaé/RJ,
com dados do Portal de Dados Abertos ([dados.gov.br](https://dados.gov.br)).

O **IEOP** é um indicador quantitativo (0–100) que avalia a eficiência de obras
públicas combinando quatro componentes:

| Componente | Sigla | O que mede |
|------------|:----:|------------|
| Custo      | **C** | custo por metro quadrado vs. referência |
| Atraso     | **P** | percentual / probabilidade de atraso |
| Recorrência| **R** | reincidência de problemas em obras do mesmo tipo/fornecedor |
| Execução   | **E** | aderência ao percentual executado planejado |

O score é traduzido em cinco classes — **Ótimo** (≥80), **Bom** (≥60),
**Regular** (≥40), **Ruim** (≥20) e **Crítico** (<20) — usadas para colorir
cards, badges, a tabela de obras e os marcadores do mapa.

> O IEOP é **calculado no backend** (`backend-ieop`) e exposto via API. O frontend
> apenas consome e exibe — toda lógica de classificação/cor é puramente visual.

---

## Sumário

- [Como funciona](#como-funciona)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Configuração de ambiente](#configuração-de-ambiente)
- [React + Bun](#react--bun)
- [Docker](#docker)
- [IEOP Analytics](#ieop-analytics)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rotas e perfis de acesso](#rotas-e-perfis-de-acesso)
- [Camada de dados](#camada-de-dados)
- [Autenticação](#autenticação)
- [O indicador IEOP](#o-indicador-ieop)
- [Endpoints consumidos](#endpoints-consumidos)
- [Testes](#testes)
- [CI](#ci)
- [Convenções](#convenções)

---

## Como funciona

O IEOP é uma **SPA React** que dá uma visão analítica das obras públicas de
Macaé/RJ. O fluxo, de ponta a ponta:

1. **Entrada** — o usuário acessa `/login` (ou `/register`, que cria sempre um
   perfil `readonly`). O backend devolve um `access_token` (mantido **em
   memória**) e um `refresh_token` (cookie httpOnly). A partir daí o
   `AuthProvider` conhece o perfil e libera as rotas.
2. **Navegação** — `PrivateRoute` protege as páginas internas; o menu lateral
   (`nav.ts`) mostra só os itens permitidos ao perfil. Rotas sensíveis têm
   guarda extra (`RagRoute` para a IA, `AdminRoute` para o backoffice).
3. **Dados** — cada página chama hooks (`use<Feature>`) que usam **TanStack
   Query** para buscar via **axios**. Toda requisição vai para `/proxy/*`
   (mesma origem) e o **servidor Bun** reencaminha ao backend, evitando CORS.
   **Toda resposta é validada com Zod** antes de chegar à UI.
4. **Apresentação** — os dados validados alimentam cards, tabelas, gráficos
   (Recharts) e mapas (Leaflet 2D / deck.gl 3D). O **IEOP** (0–100, calculado
   no backend) é traduzido em classes coloridas em toda a interface.
5. **Sessão** — em respostas `401`, um interceptor tenta **refresh silencioso**
   e repete a requisição; se falhar, encerra a sessão. Erros `500+` viram
   *toasts* não-intrusivos.

```
Login ─► AuthProvider (perfil) ─► rota protegida ─► useFeature (TanStack Query)
        ─► axios /proxy/* ─► Bun ─► Backend ─► Zod ✓ ─► UI (cards/tabela/mapa)
```

---

## Funcionalidades

### 📊 Dashboard (`/`)
- **Herói IEOP**: índice de eficiência municipal (0–100) com a média dos quatro
  componentes **C·P·R·E** (Custo, Atraso, Recorrência, Execução), calculada a
  partir das obras reais — só exibida quando todas têm dado (nada é fabricado).
- **Distribuição por classe** IEOP (Ótimo → Crítico).
- **Métricas globais** (total de obras, em andamento, valor contratado, execução
  média) com **delta % vs. período anterior** de mesma duração.
- **Seletor de período** (`PeriodToggle`) e indicador "ao vivo".
- **Top 5 alertas** de risco, **rosca** por status, **barras** por secretaria e
  **linha** de evolução mensal.

### 🏗️ Obras (`/obras`)
- **Tabela** ordenável e paginada de obras/contratos.
- **Filtros** por busca textual, status, nível de risco e secretaria.
- Colunas com **badge de risco**, **badge IEOP**, barra de execução e valores em
  BRL.
- **Exportar CSV** das obras filtradas.
- Clique em uma linha → **detalhe da obra**.

### 🔍 Detalhe da obra (`/obras/:id`)
- Cabeçalho, cards de **execução**, **datas** e **predição de ML** (probabilidade
  de atraso), seção de **contratos**, card **IEOP**, **mini-mapa** da localização
  e card do **fornecedor** responsável.

### 🗺️ Mapa 2D (`/mapa`)
- Mapa **Leaflet** georreferenciado de Macaé com **marcadores agrupados**
  (cluster), coloridos por IEOP (fallback para risco), **limite municipal**
  (GeoJSON) e **legenda** de risco.
- **Filtros** por risco, secretaria e status; **exportar CSV** do recorte.

### 🧊 Mapa 3D (`/mapa-3d`)
- Visualização 3D com **deck.gl** das obras georreferenciadas, carregada **sob
  demanda** (lazy + code-splitting) para não pesar o bundle inicial.

### 🏢 Fornecedores (`/fornecedores`)
- **Ranking** de fornecedores com CNPJ, razão social, nº de contratos, valores e
  taxa de aditivos.
- **Busca** por razão social ou CNPJ, **filtro por risco** e toggle **"Somente
  com alerta" (aditivos > 30%)**.
- **Exportar CSV**; clique → **perfil do fornecedor**.

### 👤 Perfil do fornecedor (`/fornecedores/:id`)
- Cabeçalho com indicadores, **gráfico de valor contratado por ano**, **evolução
  de risco** e **histórico de obras** do fornecedor.

### ✨ Agente IA — RAG (`/ia`) · *admin / gestor*
- Chat em **linguagem natural** sobre obras, contratos e fornecedores, com
  respostas **fundamentadas nos documentos oficiais** (RAG).
- **Sugestões de perguntas**, **histórico da sessão** (navegável) e exibição das
  **fontes** consultadas.

### 🔐 Administração (`/admin`) · *admin*
- **Backoffice** de usuários: criação de contas com perfis elevados
  (gestor/admin), exclusivo de administradores.

---

## Arquitetura

Duas interfaces no mesmo workspace, consumindo o mesmo backend:

| Pasta        | Stack                | Porta padrão | Papel |
|--------------|----------------------|:------------:|-------|
| `src/`       | React 19 + Bun       | 3000         | SPA principal (dashboard, obras, mapa, fornecedores, IA) |
| `analytics/` | Python + Streamlit   | 8501         | **IEOP Analytics** — visualizações de ML (auxiliar) |

O servidor Bun (`src/index.ts`) serve o SPA **e** atua como **proxy reverso**:
toda requisição para `/proxy/*` é encaminhada para o backend
(`API_PROXY_TARGET` ou `BUN_PUBLIC_API_URL`, default `http://localhost:8000`),
eliminando problemas de CORS em desenvolvimento.

```
Browser ──► Bun server (:3000) ──► /proxy/* ──► Backend (:8000)
              │
              └──► index.html + bundle React
```

---

## Stack

- **React 19** + **TypeScript** (modo estrito)
- **Bun** como runtime, bundler, dev server e test runner
- **React Router 7** — roteamento client-side
- **TanStack Query 5** — cache e sincronização de dados
- **Zod 4** — validação em runtime de **todas** as respostas da API
- **Recharts 3** — gráficos (donut, barras, linha)
- **Leaflet** + **react-leaflet** + **react-leaflet-cluster** — mapa 2D georreferenciado
- **deck.gl 9** — mapa 3D, carregado sob demanda (lazy + code-splitting)
- **React Hook Form** + **@hookform/resolvers** — formulários
- **axios** — cliente HTTP com interceptors (refresh silencioso, toasts de erro)
- **CSS Modules** + **design tokens** (`styles/tokens.css`) — tema escuro
- **Biome** — lint e formatação

---

## Configuração de ambiente

```bash
cp .env.example .env
# edite .env com seus valores reais
```

| Variável | Descrição |
|----------|-----------|
| `BUN_PUBLIC_API_URL` | URL do backend, exposta ao React no browser. Quando ausente, o cliente axios usa `/proxy` (proxy reverso do Bun). |
| `API_PROXY_TARGET` | **Só do servidor** (não vai para o bundle). Alvo do proxy `/proxy/*`. Tem precedência sobre `BUN_PUBLIC_API_URL`; default `http://localhost:8000`. Útil em container (`http://host.docker.internal:8000`). |
| `API_URL` | URL do backend usada pelo IEOP Analytics no servidor |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase |

> Variáveis expostas ao browser **devem** ter o prefixo `BUN_PUBLIC_`.
> O `.env` está no `.gitignore` — nunca o commite.

---

## React + Bun

### Pré-requisitos

- [Bun](https://bun.sh) >= 1.3

### Instalação e desenvolvimento

```bash
bun install
bun dev          # http://localhost:3000
```

> **HMR client-side está desligado por padrão.** O HMR do Bun 1.3.8 quebra
> imports de CSS Modules (tela branca). Reative com `HMR=true bun dev` após
> atualizar o Bun. Sempre valide o render no browser — `bun run build` bundla
> mas não executa.

### Build de produção

```bash
bun run build    # gera dist/
bun start        # NODE_ENV=production
```

### Qualidade de código (Biome)

```bash
bun run lint       # checa lint + formatação
bun run lint:fix   # aplica correções seguras
bun run format     # apenas formatação
```

---

## Docker

Imagem única (Bun) que serve o SPA **e** faz o proxy reverso para o backend —
o mesmo `src/index.ts` do dev. Veja o [`Dockerfile`](Dockerfile). O servidor
escuta na porta **3000** dentro do container.

### Build

```bash
docker build -t ieop-front .   # a partir da raiz do projeto
```

### Executar

O alvo do proxy (`/proxy/*` → backend) vem de `API_PROXY_TARGET` — variável
**só do servidor**, que não vaza para o bundle do cliente. O browser continua
falando só com `/proxy` (mesma origem), sem CORS.

**Docker Desktop / WSL2** (backend rodando no host) — bridge + port mapping,
com o proxy apontando para o host via `host.docker.internal`:

```bash
docker run -d --name ieop -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e API_PROXY_TARGET=http://host.docker.internal:8000 \
  ieop-front
# acesse http://127.0.0.1:3000
```

**Linux nativo** (daemon local) — `--network host` também funciona, e o
backend é alcançado direto em `localhost:8000` (default):

```bash
docker run -d --name ieop --network host ieop-front
```

> No Docker Desktop/WSL2, `--network host` **não** publica a porta no host —
> use o modo bridge acima. E acesse por **`127.0.0.1:3000`** (o `localhost`
> pode resolver para IPv6 `::1` e não ser encaminhado).

### Parar

```bash
docker rm -f ieop
```

---

## IEOP Analytics

**IEOP Analytics** (em `analytics/`, construído com Streamlit) é a interface
analítica complementar, focada nas **visualizações de ML** do IEOP. Um painel
multipágina que transforma as **predições de risco** do modelo (probabilidade
de atraso e de estouro de custo por obra) em quatro gráficos Plotly interativos,
respondendo de forma visual *onde* e *quanto* está o risco — por secretaria,
status, fornecedor e ao longo do tempo. É **independente** do app React — ambos
só consomem o mesmo backend/dados. Documentação detalhada em
[analytics/README.md](analytics/README.md).

### Pré-requisitos

- Python >= 3.10

### Instalação e dev

```bash
cd analytics
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run App.py         # http://localhost:8501
```

Lê o `.env` da raiz do projeto. Com `SUPABASE_URL`/`SUPABASE_ANON_KEY`
preenchidos, usa dados reais; senão, **cai para dados de exemplo** gerados
localmente (não quebra).

### Páginas

Conjunto IEOP / ML (destacado na home):

| Página | Conteúdo |
|--------|----------|
| 🌡️ Predições | mapa de calor de risco por secretaria × status, com filtros, métricas e flag de baixa amostragem |
| 🏢 Fornecedores | scatter risco × recorrência por fornecedor + tabela top 15 |
| 📈 Evolução | série temporal das predições + heatmap secretaria × mês |
| 🧊 IEOP 3D | dispersão 3D custo × atraso × IEOP com filtros |

**Destaques transversais:** fallback automático para dados de exemplo (nunca
quebra), tema escuro alinhado ao app React, **responsividade ponta a ponta**
(colunas empilham e gráficos se adaptam no mobile) e qualidade de dados
(predição mais recente por obra + normalização de *encoding*).

As páginas Features e Comparativo foram removidas por não terem fonte de
dados real (o modelo não publica `feature_importance` nem execução real ×
prevista).

---

## Estrutura do projeto

```
src/
├── index.ts                 # servidor Bun: rotas + proxy /proxy/* → backend
├── index.html               # shell HTML
├── frontend.tsx             # entrada React: QueryClient + Router + AuthProvider
├── App.tsx                  # roteamento (públicas + protegidas)
│
├── auth/                    # autenticação JWT
│   ├── tokenStore.ts        # access_token EM MEMÓRIA (nunca localStorage)
│   ├── AuthContext.tsx      # estado global + useAuthContext()
│   ├── PrivateRoute.tsx     # guarda de rota (valida sessão no mount)
│   ├── RagRoute.tsx         # guarda extra: só perfis com permissão de RAG
│   ├── permissions.ts       # canUseRAG / canRetrainML / canView
│   ├── LoginPage.tsx · RegisterPage.tsx
│
├── components/              # design system reutilizável
│   ├── Badge · Card · Table · LoadingSpinner · ErrorBoundary · PageLayout · Toast
│   ├── IEOPBadge.tsx        # badge colorido por classe IEOP
│   ├── nav.ts               # navegação canônica (filtra itens por perfil)
│   └── index.ts             # barrel export
│
├── features/<feature>/      # lógica + UI isoladas por feature
│   ├── types.ts             # tipos (re-export dos schemas Zod)
│   ├── formatters.ts        # funções puras (BRL, %, datas)
│   ├── use<Feature>.ts      # hooks de dados (TanStack Query)
│   └── <SubComponent>.tsx   # componentes presentacionais
│   ├── dashboard/           # MetricCards, gráficos, IEOPCard, IEOPDistribuicao, ieop.ts
│   ├── obras/               # filtros, tabela, ExecutionBar, RiskBadge
│   ├── mapa/                # MacaeMap (Leaflet 2D) + Mapa3D (deck.gl), markers, popups, geojson
│   ├── fornecedores/        # filtros, perfis, alertas
│   └── chat/                # agente IA (RAG)
│
├── pages/                   # orquestradores: state + hooks + layout
│   ├── Dashboard.tsx · ObrasPage.tsx · ObraDetalhePage.tsx
│   ├── MapaPage.tsx · Mapa3DPage.tsx (deck.gl, lazy) · ChatPage.tsx
│   ├── FornecedoresPage.tsx · FornecedorPerfilPage.tsx
│
├── schemas/                 # fonte única de tipos: Zod + z.infer
│   ├── ieop.schema.ts       # IEOPClasse, campos ieop_*, IEOPStats
│   ├── obras.schema.ts · obraDetalhe.schema.ts · dashboard.schema.ts
│   ├── mapa.schema.ts · fornecedores.schema.ts · auth.schema.ts
│
├── services/                # chamadas HTTP (axios) + validação Zod
│   ├── api.ts               # apiClient + interceptors (refresh, toast)
│   └── dashboard · obras · mapa · fornecedores · ia · auth
│
├── hooks/                   # useApi (axios + query), useAuth
└── styles/tokens.css        # design tokens (cores, tipografia, espaçamento)
```

---

## Rotas e perfis de acesso

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/login`, `/register` | `LoginPage` / `RegisterPage` | público |
| `/` | `Dashboard` | autenticado |
| `/obras` | `ObrasPage` | autenticado |
| `/obras/:id` | `ObraDetalhePage` | autenticado |
| `/fornecedores` | `FornecedoresPage` | autenticado |
| `/fornecedores/:id` | `FornecedorPerfilPage` | autenticado |
| `/mapa` | `MapaPage` (Leaflet 2D) | autenticado |
| `/mapa-3d` | `Mapa3DPage` (deck.gl, lazy) | autenticado |
| `/ia` | `RagRoute` → `ChatPage` (RAG) | **admin / gestor** |
| `/admin` | `AdminRoute` → `AdminUsuariosPage` (backoffice) | **admin** |

Perfis (`permissions.ts`):

| Perfil | Visualizar | Usar RAG (IA) | Re-treinar ML | Gerenciar usuários |
|--------|:----------:|:-------------:|:-------------:|:------------------:|
| `admin`    | ✅ | ✅ | ✅ | ✅ |
| `gestor`   | ✅ | ✅ | ❌ | ❌ |
| `readonly` | ✅ | ❌ | ❌ | ❌ |

Os itens "Agente IA" e "Administração" no menu (`nav.ts`) só aparecem para
perfis com `canUseRAG` / `canManageUsers`.

### Modelo de cadastro (segurança)

- **Cadastro público** (`/register`) cria **sempre `readonly`** — não há escolha
  de perfil. `userResponseSchema` faz fallback de perfil inválido para
  `readonly` (fail-closed / menor privilégio).
- **Perfis elevados** (gestor/admin) só pelo **backoffice** (`/admin`), exclusivo
  de admin, que reusa `POST /api/v1/auth/register` com o token do admin anexado.

> ⚠️ A UI **reduz** a superfície, mas a segurança real é do **backend**: o
> `/register` público deve **forçar `readonly`** e só aceitar perfil elevado com
> token de admin. Sem isso, dá para burlar chamando a API direto.

---

## Camada de dados

**Toda resposta da API é validada em runtime com Zod** antes de chegar à UI —
os schemas em `src/schemas/` são a **fonte única de verdade** dos tipos
(via `z.infer`). Isso protege a interface de respostas fora do contrato.

```ts
// services/obras.ts
export async function getObras(): Promise<ObraListItem[]> {
  const { data } = await apiClient.get("/api/v1/obras");
  return obraListItemSchema.array().parse(data); // ← valida ou lança
}
```

Os hooks (`use<Feature>`) embrulham isso em TanStack Query, com `queryKey`
incluindo os parâmetros de filtro para cache por combinação de filtros.

---

## Autenticação

- `access_token` mantido **em memória** (`tokenStore.ts`) — nunca em
  localStorage/sessionStorage.
- `refresh_token` em cookie httpOnly (`withCredentials: true`).
- Interceptor de resposta em `api.ts`:
  - **401** → tenta refresh silencioso (`/api/v1/auth/refresh`) com fila de
    retries; se falhar, limpa tokens e dispara `auth:logout`.
  - **500+** → dispara `CustomEvent("api:error")` consumido pelo `Toast`.

---

## O indicador IEOP

Implementado de forma **aditiva e defensiva** (não remove indicadores antigos
e não quebra a UI quando o backend ainda não envia os dados):

| Onde | Componente | Comportamento sem dados IEOP |
|------|-----------|------------------------------|
| Dashboard | `IEOPCard` + `IEOPDistribuicao` | bloco **oculto** |
| Tabela de Obras | coluna IEOP (somada à de Risco) | exibe `—` |
| Mapa | marcador colorido por IEOP | **fallback** para a cor de risco |
| Geral | `IEOPBadge` | classe `—` em cinza |

Utilitários em `features/dashboard/ieop.ts`:

- `IEOP_COLORS` — paleta por classe, adaptada ao **tema escuro**
- `getIEOPClasse(score)` — score → classe (`Ótimo`…`Crítico` ou `—`)
- `getIEOPColor(score)` — score → hex
- `colorForClasse(classe)` — classe → `{ hex, bg, border }`

Campos `ieop_*` são `nullable().optional()` nos schemas (`ieop.schema.ts`),
refletindo que nem toda obra terá o índice calculado.

---

## Endpoints consumidos

Base: `BUN_PUBLIC_API_URL` (ou `/proxy` em dev).

| Método | Endpoint | Uso |
|:------:|----------|-----|
| POST | `/api/v1/auth/login` · `/register` · `/refresh` | autenticação |
| GET  | `/api/v1/auth/me` | perfil do usuário logado |
| GET  | `/api/v1/dashboard` | métricas globais (com período) |
| GET  | `/api/v1/dashboard/distribuicao` | distribuição por status/secretaria |
| GET  | `/api/v1/dashboard/ieop` | resumo IEOP do município |
| GET  | `/api/v1/obras` | lista de obras (inclui campos `ieop_*`) |
| GET  | `/api/v1/obras/:id` | detalhe de uma obra |
| GET  | `/api/v1/mapa` | pontos georreferenciados |
| GET  | `/api/v1/fornecedores` · `/:id` · `/cnpj/:cnpj` | fornecedores |
| POST | `/api/v1/ia/consulta` | consulta ao agente RAG (resposta completa em JSON) |

---

## Testes

- Runner: **`bun test`** + **React Testing Library** + **happy-dom**.
- Preloads (`bunfig.toml`): `test/happydom.ts` (registra o DOM) e
  `test/setup.ts` (matchers do jest-dom + cleanup).
- Testes agrupados por módulo em `<módulo>/test/` (ex.: `src/auth/test/`,
  `src/components/test/`); snapshots em `test/__snapshots__/`.

```bash
bun test
```

---

## CI

`.github/workflows/ci.yml` roda em todo push e PR, com dois jobs paralelos:

**Frontend (Bun)** — na raiz do projeto:

1. `bun install --frozen-lockfile`
2. `bun run lint` (Biome)
3. `bun test`
4. `bun run build`

**Python / IEOP Analytics (Ruff)** — em `analytics/`:

1. `ruff check .`
2. `ruff format --check .`

---

## Git hooks (pre-commit)

O hook versionado [`.githooks/pre-commit`](.githooks/pre-commit) roda os mesmos
linters do CI **antes de cada commit**, apenas nos tipos de arquivo presentes no
commit: **Biome** (se houver `.ts/.tsx/.js/.jsx`) e **Ruff** (se houver `.py`).
Se houver erros, o commit é bloqueado.

Ative uma vez após clonar:

```bash
bun run hooks:install      # = git config core.hooksPath .githooks
```

Para corrigir o que o hook apontar:

```bash
bun run lint:fix                                        # frontend (Biome)
cd analytics && ruff check --fix . && ruff format .     # analytics (Ruff)
```

> Emergência: `git commit --no-verify` pula o hook.

---

## Convenções

- **Env do React**: prefixo `BUN_PUBLIC_`.
- **Path alias**: `@/*` → `./src/*`.
- **Tipos**: derivados dos schemas Zod via `z.infer` — nunca duplicar interfaces.
- **CSS**: CSS Modules por componente (`*.module.css`); tokens globais em
  `tokens.css`. Componentes do dashboard com gráficos usam estilo inline com
  `var(--token)` para acompanhar o Recharts.
- **Recharts**: hex hardcoded correspondente aos tokens; sempre dentro de
  `<div style={{ height: N }}><ResponsiveContainer>`.
- **Feature folders**: criar `src/features/<feature>/` quando houver
  types + formatters + hooks + 2+ componentes relacionados.
- **Segurança**: nunca persistir `access_token`; nunca commitar `.env`.
