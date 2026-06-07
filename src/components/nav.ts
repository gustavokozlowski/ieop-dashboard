// Deep import por ícone: importar do barril (@phosphor-icons/react) faz o
// bundler processar TODOS os ~9000 ícones (build de 0.2s → 40s+). Os caminhos
// individuais evitam isso.
import { BriefcaseIcon } from "@phosphor-icons/react/dist/icons/Briefcase";
import { BuildingsIcon } from "@phosphor-icons/react/dist/icons/Buildings";
import { CubeIcon } from "@phosphor-icons/react/dist/icons/Cube";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/icons/MapTrifold";
import { RobotIcon } from "@phosphor-icons/react/dist/icons/Robot";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/icons/SquaresFour";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/icons/UsersThree";
import { createElement, type ReactNode } from "react";
import { canManageUsers, canUseRAG } from "../auth/permissions";
import type { Perfil } from "../schemas/auth.schema";

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

/** Contadores opcionais exibidos como badge ao lado do item de menu. */
export interface NavCounts {
  obras?: number;
}

// Navegação canônica do app. O item do Agente IA (RAG) só aparece para
// perfis com permissão (admin/gestor) — readonly não vê. `counts` alimenta
// os badges (ex.: total de obras); ausente → item sem badge.
export function buildNav(perfil: Perfil | undefined, counts?: NavCounts): NavGroup[] {
  const principal: NavItem[] = [
    { path: "/", label: "Dashboard", icon: createElement(SquaresFourIcon) },
    {
      path: "/obras",
      label: "Obras",
      icon: createElement(BuildingsIcon),
      badge: counts?.obras != null ? counts.obras.toLocaleString("pt-BR") : undefined,
    },
    { path: "/fornecedores", label: "Fornecedores", icon: createElement(BriefcaseIcon) },
  ];

  if (canUseRAG(perfil)) {
    principal.push({ path: "/ia", label: "Agente IA", icon: createElement(RobotIcon) });
  }

  // Backoffice: só admin vê e acessa (criação de usuários gestor/admin).
  if (canManageUsers(perfil)) {
    principal.push({ path: "/admin", label: "Administração", icon: createElement(UsersThreeIcon) });
  }

  return [
    { items: principal },
    {
      label: "Relatórios",
      items: [
        { path: "/mapa", label: "Mapa", icon: createElement(MapTrifoldIcon) },
        { path: "/mapa-3d", label: "Mapa 3D", icon: createElement(CubeIcon) },
      ],
    },
  ];
}
