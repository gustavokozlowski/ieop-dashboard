import { describe, expect, it } from "bun:test";
import { canRetrainML, canUseRAG, canView } from "./permissions";

describe("permissions", () => {
  it("admin tem acesso total", () => {
    expect(canUseRAG("admin")).toBe(true);
    expect(canRetrainML("admin")).toBe(true);
    expect(canView("admin")).toBe(true);
  });

  it("gestor acessa dashboard e RAG, mas não re-treina ML", () => {
    expect(canUseRAG("gestor")).toBe(true);
    expect(canRetrainML("gestor")).toBe(false);
    expect(canView("gestor")).toBe(true);
  });

  it("readonly só visualiza (sem RAG, sem ML)", () => {
    expect(canUseRAG("readonly")).toBe(false);
    expect(canRetrainML("readonly")).toBe(false);
    expect(canView("readonly")).toBe(true);
  });

  it("perfil indefinido não acessa nada", () => {
    expect(canUseRAG(undefined)).toBe(false);
    expect(canRetrainML(undefined)).toBe(false);
    expect(canView(undefined)).toBe(false);
  });
});
