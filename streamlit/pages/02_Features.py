"""Importância das features do modelo XGBoost."""

from __future__ import annotations

import os
import sys

import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Features — IEOP", layout="wide", page_icon="📊")
st.title("📊 Importância de Features — XGBoost")
st.caption("Features mais relevantes do modelo de predição de atraso e estouro orçamentário.")

# ── Dados ─────────────────────────────────────────────────────────────────────

# A importância das features é um artefato do modelo treinado — não fica em
# `features_obras` (que guarda as features POR obra). Lemos a tabela de
# importâncias publicada pelo treino; enquanto ela não existir (ou vier sem as
# colunas esperadas), exibimos uma amostra representativa em vez de quebrar.
df = db.fetch("feature_importance")
if df.empty or {"feature_name", "importance"} - set(df.columns):
    st.info(
        "ℹ️ **Importâncias de exemplo.** O modelo ainda não publicou a tabela "
        "`feature_importance` no Supabase — exibindo uma amostra representativa.",
        icon="ℹ️",
    )
    df = db.sample_features()

df = df.sort_values("importance", ascending=False).reset_index(drop=True)

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Configurações")
    n = st.slider("Top N features", min_value=5, max_value=min(len(df), 20), value=10, step=1)
    show_cumulative = st.toggle("Exibir importância acumulada", value=True)

df_top = df.head(n).sort_values("importance")  # ascending for horizontal bar

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3 = st.columns(3)
m1.metric("Total de features", len(df))
m2.metric("Top 1", df.iloc[0]["feature_name"])
top5_pct = df.head(5)["importance"].sum()
m3.metric("Importância acumulada (top 5)", f"{top5_pct:.1%}")

st.divider()

col_bar, col_cum = st.columns([2, 1]) if show_cumulative else (st.container(), None)

# ── Gráfico de barras ─────────────────────────────────────────────────────────

with col_bar:
    fig = px.bar(
        df_top,
        x="importance",
        y="feature_name",
        orientation="h",
        color="importance",
        color_continuous_scale=[[0, "#1e2436"], [0.4, "#BA7517"], [1, "#1D9E75"]],
        hover_data={"descricao": True} if "descricao" in df_top.columns else None,
        labels={"importance": "Importância", "feature_name": "Feature"},
    )
    fig.update_traces(
        hovertemplate="<b>%{y}</b><br>Importância: %{x:.4f}<extra></extra>",
    )
    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=420,
        coloraxis_showscale=False,
        xaxis_tickformat=".3f",
        title=f"Top {n} features por importância",
    )
    st.plotly_chart(fig, use_container_width=True)

# ── Curva acumulada ────────────────────────────────────────────────────────────

if show_cumulative and col_cum is not None:
    with col_cum:
        df_cum = df.copy()
        df_cum["cumulative"] = df_cum["importance"].cumsum()
        df_cum["rank"] = range(1, len(df_cum) + 1)

        fig2 = go.Figure()
        fig2.add_scatter(
            x=df_cum["rank"],
            y=df_cum["cumulative"],
            mode="lines+markers",
            line=dict(color="#1D9E75", width=2),
            marker=dict(size=5),
            hovertemplate="Top %{x} features<br>Cobertura: %{y:.1%}<extra></extra>",
        )
        # 80% line
        fig2.add_hline(y=0.80, line_dash="dash", line_color="#BA7517", annotation_text="80%")
        fig2.add_hline(y=0.95, line_dash="dash", line_color="#A32D2D", annotation_text="95%")
        fig2.update_layout(
            **db.PLOTLY_LAYOUT,
            height=420,
            title="Importância acumulada",
            yaxis_tickformat=".0%",
            xaxis_title="Nº de features",
            yaxis_title="Cobertura",
        )
        st.plotly_chart(fig2, use_container_width=True)

# ── Tabela ────────────────────────────────────────────────────────────────────

st.subheader("Detalhes das features")
display = df.head(n).copy()
display["importance"] = display["importance"].map("{:.4f}".format)
display["rank"] = range(1, len(display) + 1)
cols_show = ["rank", "feature_name", "importance"] + (
    ["descricao"] if "descricao" in display.columns else []
)
st.dataframe(display[cols_show], use_container_width=True, hide_index=True)
