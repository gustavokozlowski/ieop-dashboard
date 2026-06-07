import os
import sys

import streamlit as st

sys.path.insert(0, os.path.dirname(__file__))
import db  # noqa: E402

st.set_page_config(
    page_title="IEOP Analytics",
    page_icon="📊",
    layout="wide",
)

st.title("📊 IEOP Analytics")
st.markdown(
    "Visualizações de ML do **Índice de Eficiência de Obras Públicas** — Macaé/RJ. "
    "Selecione uma página no menu lateral."
)

st.divider()

cols = st.columns(4)
pages = [
    ("🌡️", "Predições", "Mapa de calor de risco por secretaria e status"),
    ("🏢", "Fornecedores", "Scatter risco × recorrência por fornecedor"),
    ("📈", "Evolução", "Evolução temporal das predições de risco"),
    ("🧊", "IEOP 3D", "Dispersão 3D: custo × atraso × IEOP"),
]

for col, (icon, title, desc) in zip(cols, pages, strict=False):
    col.metric(icon, title)
    col.caption(desc)

st.divider()

# Apenas a origem dos dados (real vs. exemplo). Não expõe URLs/infra na UI.
if db.is_configured():
    st.success("✅ Conectado à base — exibindo dados reais.")
else:
    st.warning("⚠️ Base não configurada — exibindo dados de exemplo.")
