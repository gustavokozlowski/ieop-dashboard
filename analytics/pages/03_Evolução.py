"""Evolução temporal das predições de risco."""

from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="Evolução — IEOP", layout="wide", page_icon=":material/trending_up:")
db.inject_responsive_css()
st.title(":material/trending_up: Evolução Temporal das Predições")
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
        "Prob. média (último mês)",
        f"{monthly_all.iloc[-1]:.1%}",
        f"{delta:+.1%} vs anterior",
        delta_color="inverse",
        help="Probabilidade média de atraso no mês mais recente do período filtrado.",
    )
else:
    m1.metric("Prob. média", f"{df_f['prob_atraso'].mean():.1%}")

m2.metric("Meses analisados", df_f["mes"].nunique())
if len(monthly_all) >= 2:
    variacao = monthly_all.iloc[-1] - monthly_all.iloc[0]
    trend = "Crescente" if variacao > 0 else "Decrescente" if variacao < 0 else "Estável"
    # delta_color="inverse": risco subindo (delta positivo) aparece em vermelho.
    m3.metric(
        "Tendência geral",
        trend,
        f"{variacao:+.1%} no período",
        delta_color="inverse",
        help="Variação da probabilidade média do primeiro ao último mês do período.",
    )
else:
    m3.metric("Tendência geral", "—")

st.divider()

# Aviso quando há um único mês: a série temporal é degenerada.
n_meses = df_f["mes"].nunique()
if n_meses < 2:
    st.info(
        f"As predições disponíveis cobrem apenas **{n_meses} mês**. "
        "Sem variação temporal para traçar tendência — exibindo o retrato do período.",
        icon=":material/info:",
    )

# ── Gráfico de evolução ────────────────────────────────────────────────────────

st.subheader(
    "Evolução mensal — probabilidade média de atraso"
    if view == "Geral"
    else "Evolução mensal por secretaria"
)

if view == "Geral":
    monthly = (
        df_f.groupby("mes")
        .agg(avg_prob=("prob_atraso", "mean"), n_obras=("obra_id", "count"))
        .reset_index()
        .sort_values("mes")
    )
    # Eixo X categórico (rótulo de mês): evita o auto-zoom de datetime do Plotly,
    # que com um único ponto degenera em ticks de frações de segundo.
    monthly["mes_str"] = monthly["mes"].dt.strftime("%b/%Y")

    fig = go.Figure()
    # Barras de volume primeiro (ficam atrás da linha).
    fig.add_bar(
        x=monthly["mes_str"],
        y=monthly["n_obras"],
        name="Nº de obras",
        marker_color="#3b82f6",
        opacity=0.25,
        yaxis="y2",
        hovertemplate="Obras: %{y}<extra></extra>",
    )
    fig.add_scatter(
        x=monthly["mes_str"],
        y=monthly["avg_prob"],
        mode="lines+markers",
        name="Prob. média de atraso",
        line=dict(color="#A32D2D", width=2.5),
        marker=dict(size=9),
        hovertemplate="Prob.: %{y:.1%}<extra></extra>",
    )

    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=440,
        xaxis=dict(title="Mês", type="category"),
        yaxis=dict(tickformat=".0%", title="Prob. Atraso", range=[0, 1]),
        yaxis2=dict(
            title="Nº obras", overlaying="y", side="right", showgrid=False, rangemode="tozero"
        ),
        legend=dict(orientation="h", yanchor="bottom", y=1.02),
        hovermode="x unified",
    )
    st.plotly_chart(fig, width="stretch", config={"responsive": True})

else:
    monthly_sec = (
        df_f.groupby(["mes", "secretaria"])["prob_atraso"].mean().reset_index(name="avg_prob")
    )
    monthly_sec["mes_str"] = monthly_sec["mes"].dt.strftime("%b/%Y")
    fig = px.line(
        monthly_sec.sort_values("mes"),
        x="mes_str",
        y="avg_prob",
        color="secretaria",
        markers=True,
        labels={"avg_prob": "Prob. média de atraso", "mes_str": "Mês", "secretaria": "Secretaria"},
    )
    fig.update_layout(
        **db.PLOTLY_LAYOUT,
        height=440,
        xaxis=dict(title="Mês", type="category"),
        yaxis=dict(tickformat=".0%", range=[0, 1]),
        legend=dict(orientation="h", yanchor="bottom", y=1.02),
        hovermode="x unified",
    )
    fig.update_traces(marker=dict(size=9), hovertemplate="%{y:.1%}<extra>%{fullData.name}</extra>")
    st.plotly_chart(fig, width="stretch", config={"responsive": True})

# ── Heatmap de risco mês × secretaria ─────────────────────────────────────────

st.subheader("Calor de risco — secretaria × mês")

# Secretarias nas linhas (rótulos legíveis na horizontal) × meses nas colunas.
# Colunas em "%Y-%m" ordenam cronologicamente; relabel para exibição depois.
heat = (
    df_f.assign(_mes=df_f["mes"].dt.strftime("%Y-%m"))
    .groupby(["secretaria", "_mes"])["prob_atraso"]
    .mean()
    .unstack()  # sem fill_value: combinações sem obra ficam vazias, não verde "0%"
)
# Mais crítica no topo.
heat = heat.loc[heat.mean(axis=1, skipna=True).sort_values(ascending=False).index]

# type="category" evita o Plotly interpretar "2026-06" como data e dar zoom em
# frações de segundo quando há um único mês.
x_labels = [pd.to_datetime(c, format="%Y-%m").strftime("%b/%Y") for c in heat.columns]
z = heat.values
z_text = np.where(np.isnan(z), "", (np.nan_to_num(z) * 100).round(0).astype(int).astype(str) + "%")

fig2 = go.Figure(
    go.Heatmap(
        z=z,
        x=x_labels,
        y=heat.index,
        colorscale=db.RISK_COLORSCALE,
        zmin=0,
        zmax=1,
        text=z_text,
        texttemplate="%{text}",
        textfont=dict(size=11, color="#ffffff"),
        xgap=2,
        ygap=2,
        hoverongaps=False,
        hovertemplate="Secretaria: %{y}<br>Mês: %{x}<br>Prob.: %{z:.1%}<extra></extra>",
        colorbar=dict(title="Prob. Atraso", tickformat=".0%", thickness=18, len=0.9),
    )
)
fig2.update_layout(
    **db.PLOTLY_LAYOUT,
    height=max(360, 24 * len(heat.index) + 120),
    xaxis=dict(type="category", title="Mês", automargin=True),
)
fig2.update_yaxes(
    autorange="reversed",
    tickmode="array",
    tickvals=list(heat.index),
    ticktext=[db.short_label(s) for s in heat.index],
    automargin=True,
)
st.plotly_chart(fig2, width="stretch", config={"responsive": True})
st.caption("Células em branco: não há obras na combinação secretaria × mês.")
