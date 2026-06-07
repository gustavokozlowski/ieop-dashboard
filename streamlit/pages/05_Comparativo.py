"""Obras similares: execução real vs prevista."""

from __future__ import annotations

import os
import sys

import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Comparativo — IEOP", layout="wide", page_icon="⚖️")
st.title("⚖️ Execução Real vs Prevista")
st.caption("Desvio entre o percentual de execução real e o previsto pelo modelo.")

# ── Dados ─────────────────────────────────────────────────────────────────────

df = db.fetch("predicoes")
if df.empty:
    db.notice_sample()
    df = db.sample_predicoes()

# Validar colunas
if "execucao_real" not in df.columns or "execucao_prevista" not in df.columns:
    st.error("Colunas `execucao_real` e `execucao_prevista` não encontradas na tabela.")
    st.stop()

df["desvio"] = df["execucao_real"] - df["execucao_prevista"]
df["desvio_abs"] = df["desvio"].abs()

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Filtros")
    secretarias = sorted(df["secretaria"].unique().tolist())
    sel_sec = st.multiselect("Secretaria", secretarias, default=secretarias)
    status_opts = sorted(df["status"].unique().tolist())
    sel_status = st.multiselect(
        "Status",
        status_opts,
        default=status_opts,
        format_func=lambda s: db.STATUS_LABELS.get(s, s),
    )
    desvio_min = st.slider("Desvio mínimo (|real − previsto|)", 0.0, 50.0, 0.0, step=1.0)

df_f = df[
    df["secretaria"].isin(sel_sec)
    & df["status"].isin(sel_status)
    & (df["desvio_abs"] >= desvio_min)
]

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3, m4 = st.columns(4)
m1.metric("Obras analisadas", len(df_f))
mae = df_f["desvio_abs"].mean()
m2.metric("Erro médio absoluto", f"{mae:.1f} p.p.")
acima = (df_f["desvio"] > 0).sum()
m3.metric(
    "Acima do previsto", f"{acima}", f"{acima / len(df_f):.0%} do total" if len(df_f) else "—"
)
abaixo = (df_f["desvio"] < 0).sum()
m4.metric(
    "Abaixo do previsto", f"{abaixo}", f"{abaixo / len(df_f):.0%} do total" if len(df_f) else "—"
)

st.divider()

col_scatter, col_dist = st.columns([3, 2])

# ── Scatter real vs previsto ───────────────────────────────────────────────────

with col_scatter:
    fig = px.scatter(
        df_f,
        x="execucao_prevista",
        y="execucao_real",
        color="desvio",
        color_continuous_scale=[
            [0.0, "#A32D2D"],
            [0.5, "#2a2f42"],
            [1.0, "#1D9E75"],
        ],
        color_continuous_midpoint=0,
        hover_name="nome",
        hover_data={
            "execucao_prevista": ":.1f",
            "execucao_real": ":.1f",
            "desvio": ":.1f",
            "secretaria": True,
            "prob_atraso": ":.1%",
        },
        labels={
            "execucao_prevista": "Execução prevista (%)",
            "execucao_real": "Execução real (%)",
            "desvio": "Desvio (p.p.)",
        },
        size="desvio_abs",
        size_max=20,
        opacity=0.75,
    )

    # Linha de previsão perfeita
    fig.add_shape(
        type="line",
        x0=0,
        y0=0,
        x1=100,
        y1=100,
        line=dict(color="#2a2f42", dash="dash", width=1.5),
    )
    fig.add_annotation(
        x=95, y=93, text="Perfeito", showarrow=False, font=dict(color="#555b72", size=11)
    )

    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=480,
        title="Execução real × prevista (diagonal = predição perfeita)",
        coloraxis_colorbar=dict(title="Desvio (p.p.)"),
        xaxis_range=[0, 105],
        yaxis_range=[0, 105],
    )
    st.plotly_chart(fig, use_container_width=True)

# ── Distribuição de desvio ─────────────────────────────────────────────────────

with col_dist:
    fig2 = go.Figure()
    fig2.add_histogram(
        x=df_f["desvio"],
        nbinsx=25,
        marker_color="#1D9E75",
        opacity=0.8,
        name="Desvio",
        hovertemplate="Desvio: %{x:.1f} p.p.<br>Obras: %{y}<extra></extra>",
    )
    fig2.add_vline(x=0, line_dash="dash", line_color="#e8eaf0", annotation_text="zero")
    fig2.add_vline(
        x=df_f["desvio"].mean(),
        line_dash="dot",
        line_color="#BA7517",
        annotation_text=f"média {df_f['desvio'].mean():+.1f}",
    )

    fig2.update_layout(
        **db.PLOTLY_LAYOUT,
        height=480,
        title="Distribuição do desvio (real − previsto)",
        xaxis_title="Desvio (p.p.)",
        yaxis_title="Nº obras",
        showlegend=False,
    )
    st.plotly_chart(fig2, use_container_width=True)

# ── Tabela top desvios ─────────────────────────────────────────────────────────

st.subheader("Obras com maior desvio")
top_dev = (
    df_f.sort_values("desvio_abs", ascending=False)
    .head(15)[
        [
            "nome",
            "secretaria",
            "status",
            "execucao_prevista",
            "execucao_real",
            "desvio",
            "prob_atraso",
        ]
    ]
    .copy()
)
top_dev["status"] = top_dev["status"].map(db.STATUS_LABELS)
top_dev["prob_atraso"] = top_dev["prob_atraso"].map("{:.1%}".format)
top_dev["desvio"] = top_dev["desvio"].map("{:+.1f} p.p.".format)
top_dev["execucao_prevista"] = top_dev["execucao_prevista"].map("{:.1f}%".format)
top_dev["execucao_real"] = top_dev["execucao_real"].map("{:.1f}%".format)

st.dataframe(
    top_dev,
    use_container_width=True,
    hide_index=True,
    column_config={
        "nome": "Obra",
        "secretaria": "Secretaria",
        "status": "Status",
        "execucao_prevista": "Prevista",
        "execucao_real": "Real",
        "desvio": "Desvio",
        "prob_atraso": "Prob. Atraso",
    },
)
