import { describe, expect, it } from "bun:test";
import { buildNav } from "./nav";

function paths(perfil: Parameters<typeof buildNav>[0]) {
  return buildNav(perfil).flatMap((g) => g.items.map((i) => i.path));
}

describe("buildNav", () => {
  it("inclui o Agente IA (/ia) para admin e gestor", () => {
    expect(paths("admin")).toContain("/ia");
    expect(paths("gestor")).toContain("/ia");
  });

  it("oculta o Agente IA para readonly", () => {
    expect(paths("readonly")).not.toContain("/ia");
  });

  it("mantém os itens base independentemente do perfil", () => {
    for (const p of ["admin", "gestor", "readonly"] as const) {
      const ps = paths(p);
      expect(ps).toEqual(expect.arrayContaining(["/", "/obras", "/fornecedores", "/mapa"]));
    }
  });
});
