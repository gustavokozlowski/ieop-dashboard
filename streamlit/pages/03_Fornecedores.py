"""Scatter plot: risco × recorrência de fornecedor."""

from __future__ import annotations

import os
import sys

import plotly.express as px
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Fornecedores — IEOP", layout="wide", page_icon="🏢")
st.title("🏢 Risco × Recorrência de Fornecedores")
st.caption("Análise de fornecedores por probabilidade média de atraso e volume de obras.")

# ── Dados ─────────────────────────────────────────────────────────────────────

df = db.load_predicoes()
if not db.is_configured():
    db.notice_sample()

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Filtros")
    min_obras = st.slider("Mínimo de obras", 1, 15, 2)
    secretarias = sorted(df["secretaria"].unique().tolist())
    sel_sec = st.multiselect("Secretaria", secretarias, default=secretarias)
    status_opts = sorted(df["status"].unique().tolist())
    sel_status = st.multiselect(
        "Status",
        status_opts,
        default=status_opts,
        format_func=lambda s: db.STATUS_LABELS.get(s, s),
    )

df_f = df[df["secretaria"].isin(sel_sec) & df["status"].isin(sel_status)]

# ── Agregação por fornecedor ───────────────────────────────────────────────────

forn = (
    df_f.groupby(["fornecedor_id", "fornecedor_nome"])
    .agg(
        n_obras=("obra_id", "count"),
        avg_prob_atraso=("prob_atraso", "mean"),
        max_prob_atraso=("prob_atraso", "max"),
        avg_prob_estouro=("prob_estouro", "mean"),
        valor_total=("valor_contratado", "sum"),
    )
    .reset_index()
)
forn = forn[forn["n_obras"] >= min_obras]

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3, m4 = st.columns(4)
m1.metric("Fornecedores analisados", len(forn))
m2.metric("Com alto risco médio", (forn["avg_prob_atraso"] >= 0.7).sum())
recorrente = forn[forn["n_obras"] >= 5]
m3.metric("Fornecedores recorrentes (≥5 obras)", len(recorrente))
if not forn.empty:
    top = forn.loc[forn["avg_prob_atraso"].idxmax(), "fornecedor_nome"]
    m4.metric("Maior risco médio", top)

st.divider()

# ── Scatter ────────────────────────────────────────────────────────────────────

if forn.empty:
    st.warning("Sem dados com os filtros aplicados.")
    st.stop()

med_x = forn["n_obras"].median()
med_y = forn["avg_prob_atraso"].median()

fig = px.scatter(
    forn,
    x="n_obras",
    y="avg_prob_atraso",
    size="valor_total",
    color="avg_prob_atraso",
    hover_name="fornecedor_nome",
    size_max=50,
    color_continuous_scale=db.RISK_COLORSCALE,
    labels={
        "n_obras": "Nº de obras",
        "avg_prob_atraso": "Prob. média de atraso",
        "valor_total": "Valor total (R$)",
    },
    hover_data={
        "n_obras": True,
        "avg_prob_atraso": ":.1%",
        "avg_prob_estouro": ":.1%",
        "valor_total": ":,.0f",
        "fornecedor_id": False,
    },
)

# Quadrantes medianos
fig.add_vline(
    x=med_x, line_dash="dot", line_color="#2a2f42", annotation_text=f"mediana ({med_x:.0f})"
)
fig.add_hline(
    y=med_y, line_dash="dot", line_color="#2a2f42", annotation_text=f"mediana ({med_y:.1%})"
)
fig.add_hline(y=0.7, line_dash="dash", line_color="#A32D2D", annotation_text="alto risco 70%")
fig.add_hline(y=0.4, line_dash="dash", line_color="#BA7517", annotation_text="médio risco 40%")

fig.update_layout(
    **db.PLOTLY_LAYOUT,
    height=520,
    yaxis_tickformat=".0%",
    coloraxis_colorbar=dict(title="Prob. Atraso", tickformat=".0%"),
    title="Risco médio × recorrência de fornecedor (tamanho = valor total)",
)
st.plotly_chart(fig, use_container_width=True)

# ── Tabela top fornecedores ────────────────────────────────────────────────────

st.subheader("Top fornecedores por risco")
top_table = forn.sort_values("avg_prob_atraso", ascending=False).head(15).copy()
top_table["avg_prob_atraso"] = top_table["avg_prob_atraso"].map("{:.1%}".format)
top_table["avg_prob_estouro"] = top_table["avg_prob_estouro"].map("{:.1%}".format)
top_table["valor_total"] = top_table["valor_total"].map("R$ {:,.0f}".format)
st.dataframe(
    top_table[["fornecedor_nome", "n_obras", "avg_prob_atraso", "avg_prob_estouro", "valor_total"]],
    use_container_width=True,
    hide_index=True,
    column_config={
        "fornecedor_nome": "Fornecedor",
        "n_obras": "Obras",
        "avg_prob_atraso": "Prob. Atraso Média",
        "avg_prob_estouro": "Prob. Estouro Média",
        "valor_total": "Valor Total",
    },
)
