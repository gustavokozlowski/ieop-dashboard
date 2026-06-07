import os
import sys

import streamlit as st  # type: ignore

sys.path.insert(0, os.path.dirname(__file__))
import db  # noqa: E402

st.set_page_config(
    page_title="IEOP Analytics",
    page_icon=":material/bar_chart:",
    layout="wide",
)

st.title(":material/bar_chart: IEOP Analytics")
st.markdown(
    "Visualizações de ML do **Índice de Eficiência de Obras Públicas** — Macaé/RJ. "
    "Escolha uma análise abaixo ou use o menu lateral."
)

# Apenas a origem dos dados (real vs. exemplo). Não expõe URLs/infra na UI.
if db.is_configured():
    st.success("Conectado à base — exibindo dados reais.", icon=":material/check_circle:")
else:
    st.info(
        "Base não configurada — exibindo **dados de exemplo** para demonstração.",
        icon=":material/info:",
    )

st.divider()

cols = st.columns(4)
pages = [
    (
        "pages/01_Predições.py",
        ":material/thermostat:",
        "Predições",
        "Mapa de calor de risco por secretaria e status",
    ),
    (
        "pages/02_Fornecedores.py",
        ":material/business:",
        "Fornecedores",
        "Risco × recorrência por fornecedor",
    ),
    (
        "pages/03_Evolução.py",
        ":material/trending_up:",
        "Evolução",
        "Evolução temporal das predições de risco",
    ),
    (
        "pages/04_IEOP_3D.py",
        ":material/view_in_ar:",
        "IEOP 3D",
        "Dispersão 3D: custo × atraso × IEOP",
    ),
]

for col, (path, icon, title, desc) in zip(cols, pages, strict=False):
    with col.container(border=True):
        st.page_link(path, label=f"**{title}**", icon=icon)
        st.caption(desc)
