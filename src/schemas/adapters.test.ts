import { describe, expect, it } from "bun:test";
import { adaptFornecedorRanking, fornecedoresPageSchema } from "./fornecedores.schema";
import { adaptGeoJSON } from "./mapa.schema";
import { adaptObra, obrasPageSchema, situacaoToStatus } from "./obras.schema";

// Payloads espelham o contrato REAL do backend (DUOPEN 2026).

describe("situacaoToStatus", () => {
  it("mapeia texto do backend para o enum interno", () => {
    expect(situacaoToStatus("Em andamento")).toBe("em_andamento");
    expect(situacaoToStatus("Concluída")).toBe("concluida");
    expect(situacaoToStatus("Paralisada")).toBe("paralisada");
    expect(situacaoToStatus("Em fase de planejamento")).toBe("nao_iniciada");
  });
  it("cai para nao_iniciada em valor desconhecido/nulo", () => {
    expect(situacaoToStatus("Qualquer")).toBe("nao_iniciada");
    expect(situacaoToStatus(null)).toBe("nao_iniciada");
  });
});

describe("obras: envelope paginado + adaptObra", () => {
  const payload = {
    items: [
      {
        id: "abc",
        nome: "Obra X",
        num_contrato: null,
        secretaria: "SEMINF",
        bairro: null,
        situacao: "Em andamento",
        nivel_risco: "alto",
        valor_contrato: 1000,
        data_prevista_fim: "2027-01-01T00:00:00+00:00",
        percentual_executado: 42,
        prob_atraso: 0.9,
        ieop_score: 70,
        ieop_classe: "Bom",
      },
    ],
    total: 490,
    page: 1,
    size: 100,
    pages: 5,
  };

  it("valida o envelope e normaliza os campos", () => {
    const page = obrasPageSchema.parse(payload);
    const o = adaptObra(page.items[0]!);
    expect(o.status).toBe("em_andamento");
    expect(o.numero_contrato).toBe("—"); // num_contrato null → fallback
    expect(o.execucao_percentual).toBe(42); // percentual_executado
    expect(o.valor_contratado).toBe(1000); // valor_contrato
    expect(o.previsao_termino).toBe("2027-01-01T00:00:00+00:00");
    expect(o.ieop_score).toBe(70);
  });
});

describe("mapa: GeoJSON → ObraMapPoint", () => {
  const fc = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-41.84, -22.4] },
        properties: {
          id: "p1",
          nome: "Praça",
          status: "Em andamento",
          nivel_risco: "baixo",
          secretaria: null,
          bairro: "LAGOA",
          valor_contrato: 500,
        },
      },
    ],
  };

  it("inverte coordinates [lng,lat] e deriva risco", () => {
    const pts = adaptGeoJSON(fc);
    expect(pts).toHaveLength(1);
    const p = pts[0]!;
    expect(p.lat).toBe(-22.4);
    expect(p.lng).toBe(-41.84);
    expect(p.status).toBe("em_andamento");
    expect(p.prob_atraso).toBeGreaterThan(0); // derivado de nivel_risco
    expect(p.valor_contratado).toBe(500);
  });
});

describe("fornecedores: envelope + adaptFornecedorRanking", () => {
  const payload = {
    items: [
      {
        cnpj: "01309292000101",
        nome: "SERCON",
        total_contratos: 14,
        valor_total: 51029591.75,
        taxa_aditivo: 0,
        media_prob_atraso: 0.36,
        obras_concluidas: null,
        obras_em_andamento: null,
      },
    ],
    total: 846,
    page: 1,
    size: 100,
    pages: 9,
  };

  it("usa cnpj como id e mapeia media_prob_atraso", () => {
    const page = fornecedoresPageSchema.parse(payload);
    const f = adaptFornecedorRanking(page.items[0]!);
    expect(f.id).toBe("01309292000101");
    expect(f.avg_prob_atraso).toBe(0.36);
    expect(f.total_obras).toBe(14);
    expect(f.obras_concluidas).toBe(0); // null → 0
  });
});
