import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { IEOPStats } from "../../schemas/ieop.schema";
import { IEOPCard } from "./IEOPCard";
import { IEOPDistribuicao } from "./IEOPDistribuicao";

const STATS: IEOPStats = {
  media_geral: 63.4,
  classe_geral: "Bom",
  distribuicao: { Crítico: 2, Ruim: 3, Regular: 5, Bom: 8, Ótimo: 4 },
  ranking_secretarias: [{ secretaria: "Obras", media_ieop: 70 }],
  piores_obras: [{ id: "1", nome: "Obra X", ieop_score: 12, ieop_classe: "Crítico" }],
};

describe("IEOPCard", () => {
  it("exibe o score com 1 casa decimal e a classe", () => {
    render(<IEOPCard stats={STATS} />);
    expect(screen.getByText("63.4")).toBeInTheDocument();
    // "Bom" aparece no badge da classe e também na legenda de faixas.
    expect(screen.getAllByText("Bom").length).toBeGreaterThanOrEqual(1);
  });
});

describe("IEOPDistribuicao", () => {
  it("renderiza as 5 classes com as contagens (barras CSS)", () => {
    render(<IEOPDistribuicao distribuicao={STATS.distribuicao} totalObras={22} />);
    expect(screen.getByText("Distribuição por classe IEOP")).toBeInTheDocument();
    // Contagens das classes (Bom=8, Regular=5) e rodapé de classificadas.
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Obras classificadas")).toBeInTheDocument();
  });
});
