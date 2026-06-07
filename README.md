# IEOP — Índice de Eficiência de Obras Públicas (RJ)

Dashboard analítico de eficiência de obras públicas no estado do Rio de Janeiro,
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

> O IEOP é **calculado no backend** (`duopen-ml`) e exposto via API. O frontend
> apenas consome e exibe — toda lógica de classificação/cor é puramente visual.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Configuração de ambiente](#configuração-de-ambiente)
- [React + Bun](#react--bun)
- [Docker](#docker)
- [Streamlit](#streamlit)
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

## Arquitetura

Duas interfaces no mesmo workspace, consumindo o mesmo backend:

| Pasta        | Stack                | Porta padrão | Papel |
|--------------|----------------------|:------------:|-------|
| `src/`       | React 19 + Bun       | 3000         | SPA principal (dashboard, obras, mapa, fornecedores, IA) |
| `streamlit/` | Python + Streamlit   | 8501         | Protótipos analíticos auxiliares |

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
- **Leaflet** + **react-leaflet** + **markercluster** — mapa georreferenciado
- **React Hook Form** + **@hookform/resolvers** — formulários
- **axios** — cliente HTTP com interceptors (refresh silencioso, toasts de erro)
- **CSS Modules** + **design tokens** (`styles/tokens.css`) — tema escuro

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
| `API_URL` | URL do backend usada pelo Streamlit no servidor |
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

---

## Docker

Imagem única (Bun) que serve o SPA **e** faz o proxy reverso para o backend —
o mesmo `src/index.ts` do dev. Veja o [`Dockerfile`](Dockerfile). O servidor
escuta na porta **3000** dentro do container.

### Build

```bash
docker build -t mydash-front .   # a partir de my-dash/
```

### Executar

O alvo do proxy (`/proxy/*` → backend) vem de `API_PROXY_TARGET` — variável
**só do servidor**, que não vaza para o bundle do cliente. O browser continua
falando só com `/proxy` (mesma origem), sem CORS.

**Docker Desktop / WSL2** (backend rodando no host) — bridge + port mapping,
com o proxy apontando para o host via `host.docker.internal`:

```bash
docker run -d --name mydash -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e API_PROXY_TARGET=http://host.docker.internal:8000 \
  mydash-front
# acesse http://127.0.0.1:3000
```

**Linux nativo** (daemon local) — `--network host` também funciona, e o
backend é alcançado direto em `localhost:8000` (default):

```bash
docker run -d --name mydash --network host mydash-front
```

> No Docker Desktop/WSL2, `--network host` **não** publica a porta no host —
> use o modo bridge acima. E acesse por **`127.0.0.1:3000`** (o `localhost`
> pode resolver para IPv6 `::1` e não ser encaminhado).

### Parar

```bash
docker rm -f mydash
```

---

## Streamlit

Interface analítica complementar focada nas **visualizações de ML** do IEOP.
É **independente** do app React — ambos só consomem o mesmo backend/dados.
Documentação detalhada em [streamlit/README.md](streamlit/README.md).

### Pré-requisitos

- Python >= 3.10

### Instalação e dev

```bash
cd streamlit
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py         # http://localhost:8501
```

Lê o `.env` da raiz (`my-dash/.env`). Com `SUPABASE_URL`/`SUPABASE_ANON_KEY`
preenchidos, usa dados reais; senão, **cai para dados de exemplo** gerados
localmente (não quebra).

### Páginas

Conjunto IEOP / ML (destacado na home):

| Página | Conteúdo |
|--------|----------|
| 🌡️ Predições | mapa de calor de risco por secretaria × status |
| 📊 Features | importância das features do modelo XGBoost |
| 🏢 Fornecedores | scatter risco × recorrência por fornecedor |
| 📈 Evolução | evolução temporal das predições de risco |
| ⚖️ Comparativo | execução real vs. prevista (desvio) |
| 🧊 IEOP 3D | dispersão 3D custo × atraso × IEOP |

Todas as páginas (`pages/01..06`) são do conjunto IEOP/ML — as páginas-demo do
template (Métricas, Mapa de Usuários) foram removidas.

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
│   ├── mapa/                # MacaeMap (Leaflet), markers, popups, geojson
│   ├── fornecedores/        # filtros, perfis, alertas
│   └── chat/                # agente IA (RAG)
│
├── pages/                   # orquestradores: state + hooks + layout
│   ├── Dashboard.tsx · ObrasPage.tsx · ObraDetalhePage.tsx
│   ├── MapaPage.tsx · FornecedoresPage.tsx · FornecedorPerfilPage.tsx · ChatPage.tsx
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
| `/mapa` | `MapaPage` | autenticado |
| `/ia` | `RagRoute` → chat RAG | **admin / gestor** |

Perfis (`permissions.ts`):

| Perfil | Visualizar | Usar RAG (IA) | Re-treinar ML |
|--------|:----------:|:-------------:|:-------------:|
| `admin`    | ✅ | ✅ | ✅ |
| `gestor`   | ✅ | ✅ | ❌ |
| `readonly` | ✅ | ❌ | ❌ |

O item "Agente IA" no menu (`nav.ts`) só aparece para perfis com `canUseRAG`.

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

---

## Testes

- Runner: **`bun test`** + **React Testing Library** + **happy-dom**.
- Preloads (`bunfig.toml`): `test/happydom.ts` (registra o DOM) e
  `test/setup.ts` (matchers do jest-dom + cleanup).
- Testes co-localizados como `*.test.ts(x)` ao lado do código; snapshots em
  `__snapshots__/`.

```bash
bun test
```

---

## CI

`.github/workflows/ci.yml` roda em todo push e PR (`working-directory: my-dash`):

1. `bun install --frozen-lockfile`
2. `bun test`
3. `bun run build`

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
```
