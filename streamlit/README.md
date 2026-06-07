# Streamlit — Visualizações de ML do IEOP

Interface analítica em Python/Streamlit que explora as **predições de risco**
e a mecânica do modelo de ML por trás do IEOP (Índice de Eficiência de Obras
Públicas — RJ).

É uma interface **independente** do app React (`../src/`): as duas apenas
consomem os mesmos dados. Rodar uma **não** exige rodar a outra.

---

## Pré-requisitos

- Python >= 3.10

## Instalação e execução

```bash
cd streamlit
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py             # http://localhost:8501
```

Dependências (`requirements.txt`): `streamlit`, `plotly`, `pandas`, `numpy`,
`supabase`, `python-dotenv`.

---

## Fonte de dados e modo de exemplo

O módulo [`db.py`](db.py) carrega o `.env` da **raiz do projeto**
(`my-dash/.env`) independentemente do diretório atual, sem sobrescrever
variáveis já presentes no ambiente.

| Variável | Uso |
|----------|-----|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | chave anônima do Supabase |
| `API_URL` | URL do backend (exibida na home) |

**Comportamento defensivo:** se o Supabase não estiver configurado (ou a
consulta falhar), o app **cai para dados de exemplo** gerados localmente com
`numpy` — nunca quebra. A home (`app.py`) mostra o status da conexão
(`✅ Supabase conectado` ou `⚠️ usando dados de exemplo`), e cada página exibe
um banner quando está em modo de amostra.

### `db.py` — utilitários compartilhados

- `is_configured()` — há credenciais do Supabase?
- `fetch(table, columns, limit)` — consulta uma tabela e retorna um
  `DataFrame` (vazio se não configurado); cacheado por 5 min (`@st.cache_data`).
- `notice_sample()` — banner de "dados de exemplo".
- `sample_predicoes()` / `sample_features()` — geradores determinísticos
  (seed fixa) de dados de amostra para predições e importância de features.
- `PLOTLY_LAYOUT`, `RISK_COLORSCALE`, `STATUS_LABELS` — tema escuro e rótulos
  alinhados ao design do app React.

---

## Páginas

O Streamlit lista automaticamente os arquivos de [`pages/`](pages/) no menu
lateral, ordenados pelo prefixo numérico do nome.

### Conjunto IEOP / ML

| Arquivo | Título | Conteúdo |
|---------|--------|----------|
| `pages/01_Predições.py` | 🌡️ Mapa de Calor de Risco | risco por secretaria × status |
| `pages/02_Features.py` | 📊 Importância de Features (XGBoost) | ranking de features do modelo |
| `pages/03_Fornecedores.py` | 🏢 Risco × Recorrência | scatter por fornecedor |
| `pages/04_Evolução.py` | 📈 Evolução Temporal das Predições | série temporal de risco |
| `pages/05_Comparativo.py` | ⚖️ Execução Real vs Prevista | desvio de execução |
| `pages/06_IEOP_3D.py` | 🧊 IEOP 3D | dispersão 3D custo × atraso × IEOP |

> Os nomes dos arquivos definem o rótulo e a ordem na barra lateral; por isso
> usam Title Case com acento (ex.: "Predições", "Evolução").

---

## Configuração de tema

[`.streamlit/config.toml`](.streamlit/config.toml) fixa o **tema escuro**
alinhado aos design tokens do app React (fundo `#0f1117`, primária `#1D9E75`)
e roda o servidor em modo `headless`.
