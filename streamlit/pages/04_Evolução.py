"""Evolução temporal das predições de risco."""

from __future__ import annotations

import os
import sys

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Evolução — IEOP", layout="wide", page_icon="📈")
st.title("📈 Evolução Temporal das Predições")
st.caption("Tendência da probabilidade de atraso e volume de obras ao longo do tempo.")

# ── Dados ─────────────────────────────────────────────────────────────────────

df = db.load_predicoes()
if not db.is_configured():
    db.notice_sample()

df["mes"] = pd.to_datetime(df["data_predicao"], format="%Y-%m", errors="coerce")
df = df.dropna(subset=["mes"])

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Filtros")
    view = st.radio("Agrupar por", ["Geral", "Por secretaria"], horizontal=True)
    secretarias = sorted(df["secretaria"].unique().tolist())
    sel_sec = st.multiselect("Secretaria", secretarias, default=secretarias)
    meses = sorted(df["mes"].dt.strftime("%Y-%m").unique())
    if len(meses) >= 2:
        range_meses = st.select_slider("Período", options=meses, value=(meses[0], meses[-1]))
        df = df[df["mes"].dt.strftime("%Y-%m").between(range_meses[0], range_meses[1])]

df_f = df[df["secretaria"].isin(sel_sec)]

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3 = st.columns(3)
monthly_all = df_f.groupby("mes")["prob_atraso"].mean()
if len(monthly_all) >= 2:
    delta = monthly_all.iloc[-1] - monthly_all.iloc[-2]
    m1.metric(
        "Prob. média (último mês)", f"{monthly_all.iloc[-1]:.1%}", f"{delta:+.1%} vs anterior"
    )
else:
    m1.metric("Prob. média", f"{df_f['prob_atraso'].mean():.1%}")

m2.metric("Meses analisados", df_f["mes"].nunique())
trend = (
    "📈 Crescente"
    if len(monthly_all) >= 2 and monthly_all.iloc[-1] > monthly_all.iloc[0]
    else "📉 Decrescente"
)
m3.metric("Tendência geral", trend)

st.divider()

# ── Gráfico de evolução ────────────────────────────────────────────────────────

if view == "Geral":
    monthly = (
        df_f.groupby("mes")
        .agg(avg_prob=("prob_atraso", "mean"), n_obras=("obra_id", "count"))
        .reset_index()
    )
    monthly["mes_str"] = monthly["mes"].dt.strftime("%b/%y")

    fig = go.Figure()
    fig.add_scatter(
        x=monthly["mes"],
        y=monthly["avg_prob"],
        mode="lines+markers",
        name="Prob. média de atraso",
        line=dict(color="#A32D2D", width=2.5),
        marker=dict(size=7),
        hovertemplate="%{x|%b/%Y}<br>Prob.: %{y:.1%}<extra></extra>",
    )

    # Volume como barras secundárias
    fig.add_bar(
        x=monthly["mes"],
        y=monthly["n_obras"],
        name="Nº de obras",
        marker_color="#1e2436",
        opacity=0.6,
        yaxis="y2",
        hovertemplate="%{x|%b/%Y}<br>Obras: %{y}<extra></extra>",
    )

    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=440,
        title="Evolução mensal — probabilidade média de atraso",
        yaxis=dict(tickformat=".0%", title="Prob. Atraso"),
        yaxis2=dict(title="Nº obras", overlaying="y", side="right", showgrid=False),
        legend=dict(orientation="h", yanchor="bottom", y=1.02),
        hovermode="x unified",
    )
    st.plotly_chart(fig, use_container_width=True)

else:
    monthly_sec = (
        df_f.groupby(["mes", "secretaria"])["prob_atraso"].mean().reset_index(name="avg_prob")
    )
    fig = px.line(
        monthly_sec,
        x="mes",
        y="avg_prob",
        color="secretaria",
        markers=True,
        labels={"avg_prob": "Prob. média de atraso", "mes": "Mês", "secretaria": "Secretaria"},
    )
    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=440,
        title="Evolução mensal por secretaria",
        yaxis_tickformat=".0%",
        legend=dict(orientation="h", yanchor="bottom", y=1.02),
        hovermode="x unified",
    )
    fig.update_traces(hovertemplate="%{y:.1%}<extra>%{fullData.name}</extra>")
    st.plotly_chart(fig, use_container_width=True)

# ── Heatmap de risco mês × secretaria ─────────────────────────────────────────

st.subheader("Calor de risco — mês × secretaria")
heat = (
    df_f.groupby([df_f["mes"].dt.strftime("%Y-%m"), "secretaria"])["prob_atraso"]
    .mean()
    .unstack(fill_value=0)
)
fig2 = go.Figure(
    go.Heatmap(
        z=heat.values,
        x=heat.columns,
        y=heat.index,
        colorscale=db.RISK_COLORSCALE,
        zmin=0,
        zmax=1,
        hovertemplate="Mês: %{y}<br>Secretaria: %{x}<br>Prob.: %{z:.1%}<extra></extra>",
        colorbar=dict(tickformat=".0%"),
    )
)
fig2.update_layout(**db.PLOTLY_LAYOUT, height=350)
st.plotly_chart(fig2, use_container_width=True)
