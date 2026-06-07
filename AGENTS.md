# Project Agent Notes

## Scope

Bun + React 19 SPA com servidor Bun (SSR-lite + proxy reverso) e Streamlit em `streamlit/`.

## Commands

- Instalar deps: `bun install`
- Dev: `bun dev` → http://localhost:3000 (HMR client-side desligado — ver nota abaixo)
- Build: `bun run build`
- Prod: `bun start`
- Streamlit: `cd streamlit && streamlit run app.py` → http://localhost:8501

## Entry Points

| Arquivo | Papel |
|---------|-------|
| [src/index.ts](src/index.ts) | Servidor Bun — rotas + proxy `/proxy/*` → `BUN_PUBLIC_API_URL` |
| [src/index.html](src/index.html) | Shell HTML |
| [src/frontend.tsx](src/frontend.tsx) | Entrada React — monta providers (QueryClient, BrowserRouter, AuthProvider) |
| [src/App.tsx](src/App.tsx) | Roteamento — `/login` publico, `/*` protegido por `PrivateRoute` |

## Estrutura atual

```
src/
├── auth/                   # autenticacao JWT
│   ├── tokenStore.ts       # access_token em memoria (NUNCA localStorage)
│   ├── AuthContext.tsx      # estado global + Provider + useAuthContext()
│   ├── PrivateRoute.tsx     # guarda de rota (verifica sessao no mount)
│   └── LoginPage.tsx
├── components/             # design system reutilizavel
│   ├── Badge / Card / Table / LoadingSpinner / ErrorBoundary / PageLayout
│   └── index.ts            # barrel export
├── features/<feature>/     # logica + UI isoladas por feature
│   ├── types.ts            # interfaces TypeScript puras
│   ├── formatters.ts       # funcoes puras (sem efeito colateral)
│   ├── use<Feature>.ts     # hooks de dados (TanStack Query)
│   ├── Skeleton.tsx        # placeholders de carregamento
│   └── <SubComponent>.tsx  # componentes presentacionais
├── hooks/
│   ├── useApi.ts           # apiClient axios + useApi<T> + useApiMutation
│   └── useAuth.ts          # re-export de useAuthContext
├── pages/
│   └── <Page>.tsx          # orquestrador: state + hooks + layout
└── styles/
    └── tokens.css          # design tokens (cores, tipografia, espacamento)
```

## Conventions

- **Variaveis de ambiente React**: prefixo `BUN_PUBLIC_` (ex: `BUN_PUBLIC_API_URL`)
- **TypeScript path alias**: `@/*` → `./src/*`
- **HMR**: preservar bloco `import.meta.hot` em [src/frontend.tsx](src/frontend.tsx). O HMR client-side está **desligado por padrão** em [src/index.ts](src/index.ts) — o HMR do Bun 1.3.8 quebra imports de CSS Modules (`ReferenceError: import_X_module is not defined` → tela branca). Reative com `HMR=true bun dev` após atualizar o Bun. Validar render com browser (não só `bun build`, que bundla mas não executa).
- **CSS**: CSS Modules por componente (`.module.css`); tokens globais em `tokens.css`
- **Estilo de componente**: cada componente tem seu `.module.css` proprio — sem inline style para layout, sem CSS global para componentes
- **Autenticacao**: `access_token` em memoria; `refresh_token` em httpOnly cookie; interceptor axios renova silenciosamente em 401
- **Dados**: TanStack Query via `useApi<T>(endpoint, options)` — queryKey inclui query params para cache por filtro
- **Recharts**: usar hex hardcoded que corresponde aos tokens (ver SKILL.md); sempre envolver em `<div style={{ height: N }}><ResponsiveContainer>`
- **Feature folders**: criar `src/features/<feature>/` quando ha types + formatters + hooks + 2+ componentes relacionados

## Seguranca
- Nunca armazenar `access_token` em localStorage ou sessionStorage
- Nunca commitar `.env` (ja no `.gitignore`)

## Tests

- Runner: **`bun test`** (alternativa ao Vitest) + **React Testing Library** + happy-dom.
- Preloads em [bunfig.toml](bunfig.toml): `test/happydom.ts` (registra o DOM antes do
  testing-library) e `test/setup.ts` (matchers do jest-dom + cleanup).
- Testes co-localizados como `*.test.ts(x)` ao lado do código; snapshots em
  `__snapshots__/`. Mock de módulo com `mock.module(...)` + import dinâmico.
- Rodar: `bun test`. CI roda em todo push via [.github/workflows/ci.yml](../.github/workflows/ci.yml).
