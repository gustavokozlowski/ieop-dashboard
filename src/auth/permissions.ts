import type { Perfil } from "../schemas/auth.schema";

// Regras de acesso por perfil:
//  admin    → acesso total, pode disparar re-treinamento ML
//  gestor   → acesso ao dashboard e consultas RAG
//  readonly → apenas visualização, sem RAG

export function canUseRAG(perfil: Perfil | undefined): boolean {
  return perfil === "admin" || perfil === "gestor";
}

export function canRetrainML(perfil: Perfil | undefined): boolean {
  return perfil === "admin";
}

/** Todo perfil autenticado pode visualizar o dashboard e relatórios. */
export function canView(perfil: Perfil | undefined): boolean {
  return perfil !== undefined;
}
