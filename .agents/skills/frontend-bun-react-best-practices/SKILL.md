---
name: frontend-bun-react-best-practices
description: "Melhores praticas para frontend com React + TypeScript usando Bun. Use para TDD, design patterns, clean code/architecture, design systems e conventional commits."
argument-hint: "Descreva a tarefa, area da UI e impacto esperado"
---

# Frontend Best Practices (React + TS + Bun)

## Quando usar
- Planejar e implementar features de UI com React/TypeScript
- Refatorar arquitetura, design system, ou padroes de componentes
- Preparar trabalho com TDD e qualidade de codigo
- Padronizar mensagens de commit com Conventional Commits

## Entrada esperada
- Objetivo da mudanca e criterios de aceite
- Area(s) afetada(s): UI, API, estilos, build, etc.
- Restricoes: prazo, compatibilidade, sem mudar stack de testes, etc.

---

## Procedimento

### 1. Contexto e objetivos
- Reescreva o objetivo em 1–2 frases e liste criterios de aceite mensuraveis.
- Identifique impacto em UX, performance, acessibilidade e API.

### 2. Mapa de impacto
- Liste arquivos provaveis e pontos de entrada com base na estrutura abaixo.
- Consulte [AGENTS.md](../../../AGENTS.md) para comandos e convencoes do projeto.

### 3. Arquitetura e design patterns

**Separacao de responsabilidades por arquivo — regra principal do projeto:**
- `types.ts` — interfaces e tipos TypeScript puros, sem importar React
- `formatters.ts` — funcoes puras de formatacao (moeda, data, porcentagem)
- `use<Feature>.ts` — hooks de dados (so logica, sem JSX)
- `<Component>.tsx` — componente presentacional (so UI, sem fetch)
- `<Component>.module.css` — estilos isolados por componente

**Estrutura de pastas:**
```
src/
├── auth/                         # fluxo de autenticacao
│   ├── tokenStore.ts             # access token em memoria (nao localStorage)
│   ├── AuthContext.tsx           # estado global + Provider + useAuthContext
│   ├── PrivateRoute.tsx          # guarda de rota
│   └── LoginPage.tsx
├── components/                   # design system reutilizavel
│   ├── Badge.tsx / .module.css
│   ├── Card.tsx / .module.css
│   ├── Table.tsx / .module.css
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── PageLayout.tsx / .module.css
│   └── index.ts                  # barrel export
├── features/<feature>/           # feature folder (nao page folder)
│   ├── types.ts
│   ├── formatters.ts
│   ├── use<Feature>.ts
│   ├── Skeleton.tsx / .module.css
│   └── <SubComponent>.tsx / .module.css
├── hooks/
│   ├── useApi.ts                 # useApi<T> + useApiMutation
│   └── useAuth.ts                # re-export de AuthContext
├── pages/
│   └── <Page>.tsx                # orquestrador: state + hooks + layout
└── styles/
    └── tokens.css                # design tokens como CSS custom properties
```

**Padrao de componente presentacional:**
```tsx
// Props explicitamente tipadas
interface Props {
  data: MyType | undefined;
  isLoading: boolean;
}

export function MyComponent({ data, isLoading }: Props) {
  if (isLoading || !data) return <MySkeleton />;
  return <div>...</div>;
}
```

**Padrao de page (orquestrador):**
```tsx
export function MyPage() {
  const [filter, setFilter] = useState(defaultFilter);
  const query = useMyData(filter);             // so dados
  return (
    <PageLayout ...>
      <MyFilter value={filter} onChange={setFilter} />
      <MyComponent data={query.data} isLoading={query.isLoading} />
    </PageLayout>
  );
}
```

### 4. Design system

**Tokens CSS** — sempre usar variaveis de `src/styles/tokens.css`:
```css
/* Cores de status */
--color-success: #1D9E75   /* concluida */
--color-warning: #BA7517   /* risco medio */
--color-danger:  #A32D2D   /* risco alto */

/* Superficies */
--color-bg: #0f1117
--color-surface: #161b27
--color-surface2: #1e2436
--color-border: #2a2f42

/* Tipografia */
--text-xs/sm/base/lg/xl/2xl/3xl
--font-normal/medium/semibold/bold
```

**CSS Modules** — padrao do projeto (nao CSS global, nao inline style para layout):
```tsx
import styles from "./MyComponent.module.css";
// Combinar classes condicionalmente:
<div className={`${styles.item} ${isActive ? styles.active : ""}`} />
```

**Recharts** — tema escuro padrao para todos os graficos:
```tsx
const TOOLTIP_STYLE = {
  contentStyle: { background: "#161b27", border: "1px solid #2a2f42",
                  borderRadius: "8px", color: "#e8eaf0", fontSize: 13 },
  itemStyle: { color: "#8b90a8" },
};
const AXIS = { fill: "#8b90a8", fontSize: 12 };
const GRID = { stroke: "#2a2f42", strokeDasharray: "4 4" };
// Sempre envolver em <div style={{ height: N }}><ResponsiveContainer ...>
```

### 5. Dados e API

**useApi** — GET com TanStack Query:
```ts
export function useApi<T>(endpoint: string, options?) {
  return useQuery<T, Error>({
    queryKey: [endpoint],  // endpoint com query params = cache key unico
    queryFn: () => apiClient.get<T>(endpoint).then(r => r.data),
    staleTime: 30_000,
    ...options,
  });
}
// Auto-refresh: passar refetchInterval: 5 * 60 * 1000
```

**useApiMutation** — POST/PUT/PATCH/DELETE:
```ts
const mutation = useApiMutation<ResponseType, BodyType>({
  method: "POST",
  endpoint: "/api/v1/resource",
  invalidates: ["/api/v1/resource"],  // invalida cache apos sucesso
});
```

**Autenticacao:**
- `access_token` em memoria (`src/auth/tokenStore.ts`) — nunca localStorage
- `refresh_token` em httpOnly cookie gerenciado pelo servidor
- Interceptor em `useApi.ts` renova token silenciosamente em caso de 401
- Usar `useAuthContext()` para acessar `user`, `login`, `logout`, `isAuthenticated`

### 6. TDD (quando aplicavel)
- Escreva um teste falhando que cubra o criterio principal.
- Implemente o minimo para passar; refatore com foco em clareza.
- Stack recomendada: Vitest + React Testing Library.
- Se ainda nao houver framework definido, alinhe antes de adicionar.

### 7. Implementacao (clean code)
- Nomeie funcoes e componentes pelo comportamento, nao pela tecnologia.
- Evite efeitos colaterais escondidos; prefira funcoes puras quando possivel.
- Garanta tipagem explicita onde melhora a leitura do contrato.
- `noUncheckedIndexedAccess` esta ativo — trate `array[i]` como `T | undefined`.

### 8. Qualidade e revisao
- Rode `bun dev` para validar fluxo; `bun build` quando mudar build/HTML.
- Verifique erros de TypeScript e regressao visual basica.

### 9. Commit (Conventional Commits)
- Use tipos: feat, fix, refactor, docs, chore, test, style, perf.
- Descreva o impacto do usuario; use escopo quando relevante.

---

## Decisoes comuns
- **Novo componente vs hook**: extraia hook quando ha logica reutilizavel sem UI.
- **Estado local vs compartilhado**: mantenha local ate haver uso real em mais de um ponto.
- **Skeleton vs spinner**: use Skeleton para areas de conteudo; LoadingSpinner so para transicoes de pagina inteira.
- **CSS global vs module**: CSS Modules para estilos de componente; `tokens.css` para design tokens compartilhados.
- **Feature folder vs component**: feature folder quando ha types + formatters + hooks + multiplos componentes relacionados.

## Saidas esperadas
- Mudanca implementada com criterios de aceite atendidos
- Codigo legivel, tipado, e com impacto conhecido
- Commits padronizados

## Checklist pre-commit
- [ ] Fluxo principal validado no navegador (smoke test)
- [ ] Sem erros de TypeScript no editor
- [ ] `bun build` rodado com sucesso
- [ ] Skeleton cobrindo todos os estados de loading
- [ ] Variaveis CSS de token usadas (nao hex hardcoded, exceto em recharts)

## Exemplos de commits
- feat(ui): adiciona card de resumo no dashboard
- feat(dashboard): adiciona filtro de periodo com refetch automatico
- fix(api): trata erro 500 no carregamento inicial
- refactor(state): simplifica reducer de filtros
- test(ui): cobre fluxo de busca com RTL
- docs(readme): atualiza instrucoes de dev

## Referencias do projeto
- [AGENTS.md](../../../AGENTS.md)
- [README.md](../../../README.md)
- [package.json](../../../package.json)
- [src/styles/tokens.css](../../../src/styles/tokens.css)
- [src/hooks/useApi.ts](../../../src/hooks/useApi.ts)
- [src/auth/AuthContext.tsx](../../../src/auth/AuthContext.tsx)
- [src/components/index.ts](../../../src/components/index.ts)
