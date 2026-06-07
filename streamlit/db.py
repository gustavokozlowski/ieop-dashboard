"""Módulo compartilhado: conexão Supabase + geradores de dados de amostra."""

from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st
from dotenv import load_dotenv

# Carrega o .env da raiz do projeto (my-dash/.env), independente do CWD/terminal.
# Não sobrescreve variáveis já definidas no ambiente real.
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=False)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

_SECRETARIAS = [
    "Obras e Infraestrutura",
    "Saúde",
    "Educação",
    "Urbanismo",
    "Meio Ambiente",
    "Transporte",
]

_STATUS = ["em_andamento", "atrasada", "paralisada", "concluida", "nao_iniciada"]

STATUS_LABELS = {
    "em_andamento": "Em andamento",
    "concluida": "Concluída",
    "paralisada": "Paralisada",
    "atrasada": "Atrasada",
    "nao_iniciada": "Não iniciada",
}

# ── Plotly theme ──────────────────────────────────────────────────────────────

PLOTLY_LAYOUT = dict(
    template="plotly_dark",
    paper_bgcolor="#1e2436",
    plot_bgcolor="#161b27",
    font=dict(family="Inter, system-ui, sans-serif", color="#e8eaf0", size=13),
    colorway=["#1D9E75", "#BA7517", "#A32D2D", "#3b82f6", "#8b5cf6", "#f59e0b"],
    margin=dict(t=40, l=8, r=8, b=8),
)

RISK_COLORSCALE = [
    [0.00, "#1D9E75"],
    [0.40, "#BA7517"],
    [0.70, "#A32D2D"],
    [1.00, "#6b0000"],
]

# IEOP: quanto MAIOR o score (0–100), melhor → verde. Espelha as faixas/cores
# do frontend (src/features/dashboard/ieop.ts).
IEOP_COLORSCALE = [
    [0.00, "#A32D2D"],  # Crítico
    [0.20, "#D2691E"],  # Ruim
    [0.40, "#BA7517"],  # Regular
    [0.60, "#3FB984"],  # Bom
    [1.00, "#1D9E75"],  # Ótimo
]


def ieop_classe(score: float) -> str:
    """Faixa textual do IEOP a partir do score 0–100 (igual ao frontend)."""
    if score >= 80:
        return "Ótimo"
    if score >= 60:
        return "Bom"
    if score >= 40:
        return "Regular"
    if score >= 20:
        return "Ruim"
    return "Crítico"


# ── Supabase client ───────────────────────────────────────────────────────────


@st.cache_resource
def _client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    try:
        from supabase import create_client  # noqa: PLC0415

        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception:
        return None


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


@st.cache_data(ttl=300)
def fetch(table: str, columns: str = "*", limit: int = 10_000) -> pd.DataFrame:
    """Busca uma tabela do Supabase e retorna DataFrame. Retorna vazio se não configurado."""
    client = _client()
    if client is None:
        return pd.DataFrame()
    try:
        res = client.table(table).select(columns).limit(limit).execute()
        return pd.DataFrame(res.data or [])
    except Exception as exc:
        st.warning(f"Supabase — erro em `{table}`: {exc}")
        return pd.DataFrame()


def notice_sample() -> None:
    """Exibe banner informando que dados são de amostra."""
    st.info(
        "ℹ️ **Dados de exemplo.** "
        "Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env` para dados reais.",
        icon="ℹ️",
    )


# ── Geradores de dados de amostra ─────────────────────────────────────────────


def sample_predicoes(n: int = 300, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    meses = pd.date_range("2024-01", periods=14, freq="MS")

    fornecedores = [f"Construtora {chr(65 + i)}{rng.integers(1, 99)}" for i in range(30)]
    forn_ids = [f"forn-{i:03d}" for i in range(30)]

    idx_forn = rng.integers(0, 30, n)
    prob_atraso = rng.beta(2, 4, n).round(4)

    return pd.DataFrame(
        {
            "obra_id": [f"obra-{i:04d}" for i in range(n)],
            "nome": [f"Obra #{i:04d} — {rng.choice(_SECRETARIAS)}" for i in range(n)],
            "secretaria": rng.choice(_SECRETARIAS, n),
            "bairro": rng.choice(
                [
                    "Centro",
                    "Imbetiba",
                    "Lagoa",
                    "Glória",
                    "Novo Horizonte",
                    "Cabiúnas",
                    "Imboassica",
                ],
                n,
            ),
            "status": rng.choice(_STATUS, n, p=[0.40, 0.22, 0.10, 0.20, 0.08]),
            "prob_atraso": prob_atraso,
            "prob_estouro": np.clip(prob_atraso + rng.normal(0, 0.1, n), 0, 1).round(4),
            "execucao_real": rng.uniform(0, 100, n).round(1),
            "execucao_prevista": np.clip(
                rng.uniform(0, 100, n) + rng.normal(0, 10, n), 0, 100
            ).round(1),
            "valor_contratado": rng.uniform(200_000, 15_000_000, n).round(0),
            "data_predicao": rng.choice(meses.strftime("%Y-%m"), n),
            "fornecedor_id": [forn_ids[i] for i in idx_forn],
            "fornecedor_nome": [fornecedores[i] for i in idx_forn],
        }
    )


@st.cache_data(ttl=300)
def load_predicoes() -> pd.DataFrame:
    """Predições denormalizadas (predicoes ⨝ obras ⨝ fornecedores).

    A tabela `predicoes` é normalizada (id_obra, prob_atraso, prob_estouro,
    atualizado_em). As páginas esperam secretaria/status/valor/fornecedor/
    data_predicao — então juntamos com `obras` e `fornecedores`. Sem Supabase
    (ou tabelas vazias) cai para a amostra.
    """
    pred = fetch("predicoes")
    obras = fetch("obras")
    if pred.empty or obras.empty:
        return sample_predicoes()

    pred_slim = pred[["id_obra", "prob_atraso", "prob_estouro", "atualizado_em"]].rename(
        columns={"id_obra": "obra_id", "atualizado_em": "_ts"}
    )
    obra_cols = [
        c
        for c in [
            "id",
            "nome",
            "secretaria",
            "bairro",
            "situacao",
            "valor_contrato",
            "cnpj_executora",
        ]
        if c in obras.columns
    ]
    obras_slim = obras[obra_cols].rename(columns={"id": "obra_id"})
    df = pred_slim.merge(obras_slim, on="obra_id", how="inner")
    if df.empty:
        return sample_predicoes()

    # Nome do fornecedor via cnpj_executora → fornecedores.razao_social.
    forn = fetch("fornecedores")
    forn_nome = pd.Series("—", index=df.index)
    if not forn.empty and {"cnpj", "razao_social"} <= set(forn.columns) and "cnpj_executora" in df:
        mapa = dict(zip(forn["cnpj"], forn["razao_social"], strict=False))
        forn_nome = df["cnpj_executora"].map(mapa).fillna(df["cnpj_executora"]).fillna("—")

    secretaria = (
        df["secretaria"].fillna("Não informado").astype(str).str.title()
        if "secretaria" in df
        else "Não informado"
    )

    return pd.DataFrame(
        {
            "obra_id": df["obra_id"],
            "nome": df.get("nome", ""),
            "secretaria": secretaria,
            "bairro": df.get("bairro"),
            "status": df["situacao"].fillna("Não informado")
            if "situacao" in df
            else "Não informado",
            "prob_atraso": pd.to_numeric(df["prob_atraso"], errors="coerce").fillna(0.0),
            "prob_estouro": pd.to_numeric(df["prob_estouro"], errors="coerce").fillna(0.0),
            "valor_contratado": pd.to_numeric(df.get("valor_contrato"), errors="coerce").fillna(
                0.0
            ),
            "data_predicao": pd.to_datetime(df["_ts"], errors="coerce", utc=True).dt.strftime(
                "%Y-%m"
            ),
            "fornecedor_id": (df["cnpj_executora"].fillna("—") if "cnpj_executora" in df else "—"),
            "fornecedor_nome": forn_nome,
        }
    )


def sample_features(seed: int = 42) -> pd.DataFrame:
    features = [
        ("atraso_historico_fornecedor", "Histórico de atrasos do fornecedor"),
        ("complexidade_obra", "Índice de complexidade técnica"),
        ("valor_contratado_log", "Log do valor contratado (R$)"),
        ("n_aditivos_anteriores", "Nº de aditivos em obras anteriores"),
        ("dias_desde_inicio", "Dias corridos desde o início"),
        ("chuva_acumulada_30d", "Chuva acumulada últimos 30 dias"),
        ("execucao_percentual", "Percentual de execução atual"),
        ("orcamento_desvio_pct", "Desvio percentual do orçamento"),
        ("secretaria_encoded", "Secretaria responsável (encoded)"),
        ("tipo_obra_encoded", "Tipo de obra (encoded)"),
        ("n_funcionarios", "Nº de funcionários alocados"),
        ("dias_para_termino", "Dias restantes até previsão de término"),
        ("fornecedor_obras_ativas", "Obras ativas simultâneas do fornecedor"),
        ("bairro_risco_index", "Índice de risco do bairro"),
        ("equipe_fiscalizacao", "Tamanho da equipe de fiscalização"),
    ]
    rng = np.random.default_rng(seed)
    names, descs = zip(*features, strict=False)
    imp = rng.dirichlet(np.array([6, 5, 4, 4, 3, 2, 3, 2, 1.5, 1.5, 1, 1, 2, 1, 1]))
    return (
        pd.DataFrame({"feature_name": names, "descricao": descs, "importance": imp.round(5)})
        .sort_values("importance", ascending=False)
        .reset_index(drop=True)
    )


def sample_obras(n: int = 400, seed: int = 42) -> pd.DataFrame:
    """Amostra de obras com IEOP, custo e atraso — base do scatter 3D."""
    rng = np.random.default_rng(seed)

    valor = rng.uniform(200_000, 15_000_000, n).round(0)
    area = np.where(rng.random(n) < 0.85, rng.uniform(80, 20_000, n).round(0), np.nan)
    # IEOP tende a cair quando há mais atraso; geramos correlacionado.
    dias_atraso = rng.gamma(shape=2.0, scale=35, size=n).round(0)
    base = rng.normal(58, 18, n)
    ieop_score = np.clip(base - dias_atraso * 0.06, 0, 100).round(2)

    df = pd.DataFrame(
        {
            "id": [f"obra-{i:04d}" for i in range(n)],
            "nome": [f"Obra #{i:04d} — {rng.choice(_SECRETARIAS)}" for i in range(n)],
            "secretaria": rng.choice(_SECRETARIAS, n),
            "situacao": rng.choice(
                ["Em andamento", "Concluída", "Paralisada", "Cancelada", "Em fase de planejamento"],
                n,
                p=[0.45, 0.25, 0.08, 0.07, 0.15],
            ),
            "valor_contrato": valor,
            "area_m2": area,
            "dias_atraso": dias_atraso,
            "ieop_score": ieop_score,
        }
    )
    df["ieop_classe"] = df["ieop_score"].apply(ieop_classe)
    df["custo_m2"] = (df["valor_contrato"] / df["area_m2"]).round(0)
    return df
