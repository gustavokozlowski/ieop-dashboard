"""Scatter 3D: relação entre custo, atraso e IEOP das obras."""

from __future__ import annotations

import os
import sys

import pandas as pd
import plotly.express as px
import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db  # noqa: E402

st.set_page_config(page_title="IEOP 3D — Custo × Atraso × IEOP", layout="wide", page_icon="🧊")
st.title("🧊 Custo × Atraso × IEOP")
st.caption(
    "Cada ponto é uma obra. As três variáveis contínuas aparecem juntas — "
    "arraste para girar e identifique aglomerados de baixo IEOP."
)

# ── Dados ─────────────────────────────────────────────────────────────────────

df = db.fetch("obras")
if df.empty:
    db.notice_sample()
    df = db.sample_obras()

REQUIRED = {"valor_contrato", "dias_atraso", "ieop_score"}
faltando = REQUIRED - set(df.columns)
if faltando:
    st.warning(f"Tabela `obras` sem as colunas {sorted(faltando)} — usando dados de amostra.")
    df = db.sample_obras()

# Garante numérico e remove obras sem as 3 dimensões.
df = df.copy()
for col in ("valor_contrato", "dias_atraso", "ieop_score", "area_m2"):
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

df = df.dropna(subset=["valor_contrato", "dias_atraso", "ieop_score"])
if "ieop_classe" not in df.columns:
    df["ieop_classe"] = df["ieop_score"].apply(db.ieop_classe)
if "custo_m2" not in df.columns and "area_m2" in df.columns:
    df["custo_m2"] = (df["valor_contrato"] / df["area_m2"]).round(0)
if "nome" not in df.columns:
    df["nome"] = df.get("id", df.index.astype(str))
if "secretaria" not in df.columns:
    df["secretaria"] = "—"

if df.empty:
    st.error("Sem obras com custo, atraso e IEOP preenchidos para plotar.")
    st.stop()

# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("Filtros")

    secretarias = sorted(df["secretaria"].dropna().unique().tolist())
    sel_sec = st.multiselect("Secretaria", secretarias, default=secretarias)

    has_custo_m2 = "custo_m2" in df.columns and df["custo_m2"].notna().any()
    eixo_x = st.radio(
        "Eixo X (custo)",
        ["valor_contrato"] + (["custo_m2"] if has_custo_m2 else []),
        format_func=lambda c: {
            "valor_contrato": "Valor do contrato (R$)",
            "custo_m2": "Custo por m² (R$)",
        }[c],
    )

    ieop_lo, ieop_hi = st.slider("Faixa de IEOP", 0.0, 100.0, (0.0, 100.0), step=1.0)
    atraso_max = int(df["dias_atraso"].max())
    atraso_lim = st.slider("Atraso máximo (dias)", 0, atraso_max, atraso_max, step=5)

df_f = df[
    df["secretaria"].isin(sel_sec)
    & df["ieop_score"].between(ieop_lo, ieop_hi)
    & (df["dias_atraso"] <= atraso_lim)
]
if eixo_x == "custo_m2":
    df_f = df_f.dropna(subset=["custo_m2"])

# ── Métricas ──────────────────────────────────────────────────────────────────

m1, m2, m3 = st.columns(3)
m1.metric("Obras no gráfico", len(df_f))
m2.metric("IEOP médio", f"{df_f['ieop_score'].mean():.1f}" if len(df_f) else "—")
m3.metric("Atraso médio", f"{df_f['dias_atraso'].mean():.0f} dias" if len(df_f) else "—")

if df_f.empty:
    st.info("Nenhuma obra atende aos filtros selecionados.")
    st.stop()

# ── Scatter 3D ────────────────────────────────────────────────────────────────

X_LABELS = {"valor_contrato": "Valor do contrato (R$)", "custo_m2": "Custo por m² (R$)"}

fig = px.scatter_3d(
    df_f,
    x=eixo_x,
    y="dias_atraso",
    z="ieop_score",
    color="ieop_score",
    color_continuous_scale=db.IEOP_COLORSCALE,
    range_color=(0, 100),
    hover_name="nome",
    hover_data={
        "secretaria": True,
        "ieop_classe": True,
        eixo_x: ":,.0f",
        "dias_atraso": ":.0f",
        "ieop_score": ":.2f",
    },
    height=680,
)
fig.update_traces(marker=dict(size=4, opacity=0.85, line=dict(width=0)))

AXIS = dict(
    backgroundcolor="#161b27", gridcolor="#2a2f42", color="#8b90a8", zerolinecolor="#2a2f42"
)
fig.update_layout(
    template="plotly_dark",
    paper_bgcolor="#1e2436",
    font=dict(family="Inter, system-ui, sans-serif", color="#e8eaf0", size=13),
    margin=dict(t=10, l=0, r=0, b=0),
    coloraxis_colorbar=dict(title="IEOP"),
    scene=dict(
        xaxis=dict(title=X_LABELS[eixo_x], **AXIS),
        yaxis=dict(title="Dias de atraso", **AXIS),
        zaxis=dict(title="IEOP (0–100)", **AXIS),
    ),
)

st.plotly_chart(fig, use_container_width=True)

st.caption(
    "Cor = IEOP (vermelho = crítico, verde = ótimo). "
    "Pontos baixos (Z) e ao fundo (Y alto) concentram obras de pior eficiência e maior atraso."
)
