import type { ReactNode } from "react";
import { canUseRAG } from "../auth/permissions";
import type { Perfil } from "../schemas/auth.schema";
import { DashboardIcon, FornecedoresIcon, IAIcon, Mapa3DIcon, MapaIcon, ObrasIcon } from "./icons";

export interface NavItem {
  path: string;
  label: string;
  icon?: ReactNode;
  /** Contador opcional exibido à direita do item (ex.: Obras "342"). */
  badge?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

// Navegação canônica do app. O item do Agente IA (RAG) só aparece para
// perfis com permissão (admin/gestor) — readonly não vê.
export function buildNav(perfil: Perfil | undefined): NavGroup[] {
  const principal: NavItem[] = [
    { path: "/", label: "Dashboard", icon: DashboardIcon({}) },
    { path: "/obras", label: "Obras", icon: ObrasIcon({}) },
    { path: "/fornecedores", label: "Fornecedores", icon: FornecedoresIcon({}) },
  ];

  if (canUseRAG(perfil)) {
    principal.push({ path: "/ia", label: "Agente IA", icon: IAIcon({}) });
  }

  return [
    { items: principal },
    {
      label: "Relatórios",
      items: [
        { path: "/mapa", label: "Mapa", icon: MapaIcon({}) },
        { path: "/mapa-3d", label: "Mapa 3D", icon: Mapa3DIcon({}) },
      ],
    },
  ];
}
