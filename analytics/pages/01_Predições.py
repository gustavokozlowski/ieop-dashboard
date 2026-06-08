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

st.set_page_config(page_title="Predições — IEOP", layout="wide", page_icon=":material/thermostat:")
db.inject_responsive_css()
st.title(":material/thermostat: Mapa de Calor de Risco")
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
    st.divider()
    min_n = st.slider(
        "Amostra mínima por célula",
        1,
        10,
        1,
        help="Células com menos obras que este valor têm baixa confiança estatística "
        "(a média vem de poucas obras).",
    )
    low_conf_mode = st.radio(
        "Células de baixa amostragem",
        ["Marcar", "Ocultar"],
        horizontal=True,
        help="Marcar mantém a célula com um asterisco; Ocultar a esconde do mapa.",
    )

df_f = df[df["secretaria"].isin(sel_sec) & df["status"].isin(sel_status)]

if df_f.empty:
    st.warning(
        "Nenhuma obra corresponde aos filtros. Ajuste a seleção na barra lateral.",
        icon=":material/filter_alt_off:",
    )
    st.stop()

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3, m4 = st.columns(4)
m1.metric("Total de obras", f"{len(df_f):,}")
m2.metric(
    "Prob. média de atraso",
    f"{df_f['prob_atraso'].mean():.1%}",
    help="Média da probabilidade de atraso prevista pelo modelo nas obras filtradas.",
)
alto_risco = (df_f["prob_atraso"] >= 0.7).sum()
m3.metric(
    "Com alto risco (≥70%)",
    f"{alto_risco:,}",
    f"{alto_risco / len(df_f):.1%} do total",
    delta_color="inverse",
    help="Obras com probabilidade de atraso igual ou superior a 70%.",
)
top_sec = df_f.groupby("secretaria")["prob_atraso"].mean().idxmax()
m4.metric(
    "Secretaria mais crítica",
    top_sec,
    help="Secretaria com a maior probabilidade média de atraso no recorte atual.",
)

st.divider()

# ── Pivot heatmap ─────────────────────────────────────────────────────────────

grouped = df_f.groupby(["secretaria", "status"])["prob_atraso"]
# fill_value=NaN: combinações sem obra ficam VAZIAS (não verde "0%"), para não
# confundir "sem dados" com "risco baixo".
pivot = grouped.mean().unstack()
counts = grouped.size().unstack()

# Secretaria mais crítica no topo: ordena pela prob. média da linha (desc).
order = pivot.mean(axis=1, skipna=True).sort_values(ascending=False).index
pivot = pivot.loc[order]
counts = counts.loc[order]

x_labels = [db.STATUS_LABELS.get(c, c) for c in pivot.columns]
z = pivot.values.copy()
n = counts.values

# Células com dado mas amostra abaixo do limite = baixa confiança estatística.
low_mask = (~np.isnan(z)) & (np.nan_to_num(n) < min_n)
n_low = int(low_mask.sum())
if n_low and low_conf_mode == "Ocultar":
    z[low_mask] = np.nan

pct = (np.nan_to_num(z) * 100).round(1).astype(str) + "%"
z_text = np.where(np.isnan(z), "", pct)
# Asterisco nas células de baixa amostragem que continuam visíveis.
if n_low and low_conf_mode == "Marcar":
    z_text = np.where(low_mask, np.char.add(pct, " *"), z_text)

fig = go.Figure(
    go.Heatmap(
        z=z,
        x=x_labels,
        y=pivot.index,
        customdata=counts.values,
        colorscale=db.RISK_COLORSCALE,
        zmin=0,
        zmax=1,
        text=z_text,
        texttemplate="%{text}",
        textfont=dict(size=11, color="#ffffff"),
        xgap=2,
        ygap=2,
        hoverongaps=False,
        hovertemplate=(
            "Secretaria: %{y}<br>Status: %{x}<br>"
            "Prob. Atraso: %{z:.1%}<br>Obras: %{customdata}<extra></extra>"
        ),
        colorbar=dict(
            title="Prob. Atraso",
            tickformat=".0%",
            tickvals=[0, 0.25, 0.5, 0.75, 1],
            thickness=18,
            len=0.9,
        ),
    )
)
st.subheader("Prob. média de atraso — secretaria × status")
# Altura proporcional ao nº de secretarias para os rótulos não se sobreporem.
heat_height = max(420, 26 * len(pivot.index) + 140)
fig.update_layout(**db.PLOTLY_LAYOUT, height=heat_height)
fig.update_xaxes(side="bottom", automargin=True)
# ticktext curto evita que nomes longos sejam cortados em telas estreitas;
# tickvals mantém as categorias completas (hover/dados intactos).
fig.update_yaxes(
    autorange="reversed",
    tickmode="array",
    tickvals=list(pivot.index),
    ticktext=[db.short_label(s) for s in pivot.index],
    automargin=True,
)
st.plotly_chart(fig, width="stretch", config={"responsive": True})

caption = "Células em branco: não há obras na combinação secretaria × status."
if n_low:
    if low_conf_mode == "Marcar":
        caption += (
            f" **\\***  {n_low} célula(s) com menos de {min_n} obra(s) "
            "— baixa confiança estatística."
        )
    else:
        caption += f" {n_low} célula(s) ocultada(s) por amostra < {min_n} obra(s)."
st.caption(caption)

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
fig2.update_xaxes(
    tickmode="array",
    tickvals=list(pivot_dist.index),
    ticktext=[db.short_label(s) for s in pivot_dist.index],
    automargin=True,
)
st.plotly_chart(fig2, width="stretch", config={"responsive": True})
