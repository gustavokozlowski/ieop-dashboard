# IEOP Analytics — Visualizações de ML

**IEOP Analytics** é a interface analítica (em Python/Streamlit) que explora as
**predições de risco** e a mecânica do modelo de ML por trás do IEOP (Índice de
Eficiência de Obras Públicas — Macaé/RJ).

É uma interface **independente** do app React (`../src/`): as duas apenas
consomem os mesmos dados. Rodar uma **não** exige rodar a outra.

---

## Visão geral

Um painel **multipágina em Streamlit** que transforma as predições de risco do
modelo de ML (probabilidade de atraso e de estouro de custo por obra) em quatro
visualizações interativas em Plotly. O objetivo é responder, de forma visual,
*onde* e *quanto* está o risco — por secretaria, por status, por fornecedor e ao
longo do tempo — e relacioná-lo ao IEOP.

## Funcionalidades

### 🌡️ Mapa de Calor de Risco — `pages/01_Predições.py`
- Heatmap da **probabilidade média de atraso** por **secretaria × status**.
- Métricas de topo: total de obras, prob. média, **% em alto risco (≥70%)** e
  **secretaria mais crítica** do recorte.
- Filtros de secretaria e status na barra lateral.
- **Células vazias ficam em branco** (sem obra) — distinguindo "sem dado" de
  "risco 0%", em vez de pintar de verde enganoso.
- Linhas **ordenadas da mais crítica para a menos crítica**.
- **Controle de amostra mínima por célula**: marca (com `*`) ou oculta células
  cuja média vem de poucas obras (baixa confiança estatística).
- Gráfico complementar de **distribuição de risco** (Alto/Médio/Baixo) por
  secretaria, em barras empilhadas.

### 🏢 Risco × Recorrência de Fornecedores — `pages/02_Fornecedores.py`
- **Scatter de bolhas**: risco médio de atraso × nº de obras (recorrência),
  tamanho da bolha = valor total contratado, cor = probabilidade de atraso.
- Linhas de **quadrante** (medianas) e limiares de risco (40% / 70%) para leitura
  rápida dos fornecedores problemáticos.
- **Tabela dos 15 fornecedores** de maior risco, com obras, prob. de atraso/estouro
  e valor total.

### 📈 Evolução Temporal das Predições — `pages/03_Evolução.py`
- Série mensal da **prob. média de atraso** com o **volume de obras** em eixo
  secundário.
- Dois modos: **Geral** e **Por secretaria** (uma linha por secretaria).
- Filtros de **período** e secretaria; métricas de **tendência** (crescente /
  decrescente e variação no período).
- Heatmap **secretaria × mês** como leitura complementar.
- Robusto a **um único mês** de dados (eixo categórico + aviso, sem gráfico quebrado).

### 🧊 IEOP 3D — `pages/04_IEOP_3D.py`
- **Dispersão 3D** custo × dias de atraso × IEOP, com cor pelo score IEOP.
- Filtros de secretaria, **faixa de IEOP**, atraso máximo e escolha do eixo de
  custo (**valor do contrato** ou **custo por m²**).
- Métricas: obras no gráfico, IEOP médio e atraso médio.

### Recursos transversais
- **Fallback para dados de exemplo** quando não há Supabase — o app nunca quebra.
- **Tema escuro** alinhado aos design tokens do app React.
- **Responsivo de ponta a ponta**: colunas empilham em telas estreitas, gráficos
  Plotly se adaptam à largura e nomes longos de secretaria são abreviados nos
  eixos (nome completo preservado no *hover*).
- **Qualidade de dados**: usa apenas a **predição mais recente** por obra e
  normaliza rótulos com problema de *encoding* (mojibake).
- **Cache** de 5 min nas consultas ao Supabase.

---

## Pré-requisitos

- Python >= 3.10

## Instalação e execução

```bash
cd analytics
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run App.py             # http://localhost:8501
```

Dependências (`requirements.txt`): `streamlit`, `plotly`, `pandas`, `numpy`,
`supabase`, `python-dotenv`.

---

## Fonte de dados e modo de exemplo

O módulo [`db.py`](db.py) carrega o `.env` da **raiz do projeto**
independentemente do diretório atual, sem sobrescrever variáveis já presentes
no ambiente.

| Variável | Uso |
|----------|-----|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | chave anônima do Supabase |
| `API_URL` | URL do backend (uso server-side; não exibida na UI) |

**Comportamento defensivo:** se o Supabase não estiver configurado (ou a
consulta falhar), o app **cai para dados de exemplo** gerados localmente com
`numpy` — nunca quebra. A home (`App.py`) indica a **origem dos dados**
(`✅ Conectado à base — dados reais` ou `⚠️ dados de exemplo`), sem expor URLs,
e cada página exibe um banner quando está em modo de amostra.

### `db.py` — utilitários compartilhados

- `is_configured()` — há credenciais do Supabase?
- `fetch(table, columns, limit)` — consulta uma tabela e retorna um
  `DataFrame` (vazio se não configurado); cacheado por 5 min (`@st.cache_data`).
- `notice_sample()` — banner de "dados de exemplo".
- `sample_predicoes()` / `sample_obras()` — geradores determinísticos
  (seed fixa) de dados de amostra para predições e obras.
- `load_predicoes()` — predições denormalizadas (junta `predicoes ⨝ obras ⨝
  fornecedores` e mantém só a predição mais recente por obra).
- `clean_label()` / `short_label()` — normaliza mojibake e abrevia rótulos
  longos de eixo.
- `ieop_classe()` — faixa textual do IEOP (Ótimo…Crítico) a partir do score.
- `inject_responsive_css()` — CSS que empilha colunas e adapta gráficos no mobile.
- `PLOTLY_LAYOUT`, `RISK_COLORSCALE`, `IEOP_COLORSCALE`, `STATUS_LABELS` — tema
  escuro e rótulos alinhados ao design do app React.

---

## Estrutura e roteamento

`App.py` é a **home** (índice das análises). O Streamlit lista automaticamente
os arquivos de [`pages/`](pages/) no menu lateral, ordenados pelo prefixo
numérico do nome — o que cada página faz está em [Funcionalidades](#funcionalidades).

```
analytics/
├── App.py                 # home + índice das análises
├── db.py                  # dados (Supabase/amostra), tema e utilitários
├── pages/
│   ├── 01_Predições.py    # 🌡️ Mapa de Calor de Risco
│   ├── 02_Fornecedores.py # 🏢 Risco × Recorrência
│   ├── 03_Evolução.py     # 📈 Evolução Temporal das Predições
│   └── 04_IEOP_3D.py      # 🧊 IEOP 3D
└── .streamlit/config.toml # tema escuro + headless
```

> Os nomes dos arquivos definem o rótulo e a ordem na barra lateral; por isso
> usam Title Case com acento (ex.: "Predições", "Evolução").

---

## Configuração de tema

[`.streamlit/config.toml`](.streamlit/config.toml) fixa o **tema escuro**
alinhado aos design tokens do app React (fundo `#0f1117`, primária `#1D9E75`)
e roda o servidor em modo `headless`.
