import os
import sys

import streamlit as st

sys.path.insert(0, os.path.dirname(__file__))
import db  # noqa: E402

st.set_page_config(
    page_title="IEOP — Eficiência de Obras Públicas",
    page_icon="🏗️",
    layout="wide",
)

st.title("🏗️ IEOP — Índice de Eficiência de Obras Públicas (RJ)")
st.markdown("Selecione uma página no menu lateral para explorar as visualizações de ML.")

st.divider()

cols = st.columns(5)
pages = [
    ("🌡️", "Predições", "Mapa de calor de risco por secretaria e status"),
    ("📊", "Features", "Importância das features do modelo XGBoost"),
    ("🏢", "Fornecedores", "Scatter risco × recorrência por fornecedor"),
    ("📈", "Evolução", "Evolução temporal das predições de risco"),
    ("⚖️", "Comparativo", "Real vs previsto — desvio de execução"),
]

for col, (icon, title, desc) in zip(cols, pages, strict=False):
    col.metric(icon, title)
    col.caption(desc)

st.divider()

status_col, api_col, sb_col = st.columns(3)

with status_col:
    configured = db.is_configured()
    if configured:
        st.success("✅ Supabase conectado")
    else:
        st.warning("⚠️ Supabase não configurado — usando dados de exemplo")

with api_col:
    api = os.getenv("API_URL", "não configurado")
    st.info(f"**API:** `{api}`")

with sb_col:
    url = os.getenv("SUPABASE_URL", "não configurado")
    st.info(f"**Supabase URL:** `{url[:40]}…`" if len(url) > 40 else f"**Supabase URL:** `{url}`")
