"""Mapa de calor de risco por secretaria × status."""

from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Predições — IEOP", layout="wide", page_icon="🌡️")
st.title("🌡️ Mapa de Calor de Risco")
st.caption("Probabilidade média de atraso por secretaria e status da obra.")

# ── Dados ─────────────────────────────────────────────────────────────────────

df = db.load_predicoes()
if not db.is_configured():
    db.notice_sample()

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Filtros")
    secretarias = ["Todas"] + sorted(df["secretaria"].unique().tolist())
    sel_sec = st.multiselect("Secretaria", secretarias[1:], default=secretarias[1:])
    status_opts = sorted(df["status"].unique().tolist())
    sel_status = st.multiselect(
        "Status",
        status_opts,
        default=status_opts,
        format_func=lambda s: db.STATUS_LABELS.get(s, s),
    )

df_f = (
    df[df["secretaria"].isin(sel_sec) & df["status"].isin(sel_status)]
    if sel_sec and sel_status
    else df
)

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3, m4 = st.columns(4)
m1.metric("Total de obras", f"{len(df_f):,}")
m2.metric("Prob. média de atraso", f"{df_f['prob_atraso'].mean():.1%}")
alto_risco = (df_f["prob_atraso"] >= 0.7).sum()
m3.metric("Com alto risco (≥70%)", f"{alto_risco:,}", f"{alto_risco / len(df_f):.1%} do total")
top_sec = df_f.groupby("secretaria")["prob_atraso"].mean().idxmax()
m4.metric("Secretaria mais crítica", top_sec)

st.divider()

# ── Pivot heatmap ─────────────────────────────────────────────────────────────

pivot = df_f.groupby(["secretaria", "status"])["prob_atraso"].mean().unstack(fill_value=0)

x_labels = [db.STATUS_LABELS.get(c, c) for c in pivot.columns]
z_text = (pivot.values * 100).round(1).astype(str)
z_text = np.where(pivot.values > 0, z_text + "%", "")

fig = go.Figure(
    go.Heatmap(
        z=pivot.values,
        x=x_labels,
        y=pivot.index,
        colorscale=db.RISK_COLORSCALE,
        zmin=0,
        zmax=1,
        text=z_text,
        texttemplate="%{text}",
        textfont=dict(size=12),
        hovertemplate="Secretaria: %{y}<br>Status: %{x}<br>Prob. Atraso: %{z:.1%}<extra></extra>",
        colorbar=dict(
            title="Prob. Atraso",
            tickformat=".0%",
            tickvals=[0, 0.25, 0.5, 0.75, 1],
        ),
    )
)
fig.update_layout(
    **db.PLOTLY_LAYOUT, height=420, title="Prob. média de atraso — secretaria × status"
)
fig.update_xaxes(side="bottom")
st.plotly_chart(fig, use_container_width=True)

# ── Distribuição de risco ─────────────────────────────────────────────────────

st.subheader("Distribuição de risco por secretaria")

risk_dist = df_f.copy()
risk_dist["nivel"] = pd.cut(
    risk_dist["prob_atraso"],
    bins=[0, 0.4, 0.7, 1.0],
    labels=["Baixo", "Médio", "Alto"],
    include_lowest=True,
)
pivot_dist = risk_dist.groupby(["secretaria", "nivel"], observed=True).size().unstack(fill_value=0)

fig2 = go.Figure()
colors = {"Baixo": "#1D9E75", "Médio": "#BA7517", "Alto": "#A32D2D"}
for nivel in ["Alto", "Médio", "Baixo"]:
    if nivel in pivot_dist.columns:
        fig2.add_bar(
            name=nivel,
            x=pivot_dist.index,
            y=pivot_dist[nivel],
            marker_color=colors[nivel],
            hovertemplate=f"{nivel}: %{{y}} obras<extra></extra>",
        )
fig2.update_layout(
    **db.PLOTLY_LAYOUT,
    barmode="stack",
    height=340,
    showlegend=True,
    legend=dict(orientation="h", yanchor="bottom", y=1.02),
)
st.plotly_chart(fig2, use_container_width=True)
