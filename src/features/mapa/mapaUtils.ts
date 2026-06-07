import L from "leaflet";
import { getIEOPColor } from "../dashboard/ieop";
import type { MapFilter, ObraMapPoint, RiscoNivel } from "./types";
import { RISCO_COLORS } from "./types";

export function getRiscoNivel(prob: number): RiscoNivel {
  if (prob >= 0.7) return "alto";
  if (prob >= 0.4) return "medio";
  return "baixo";
}

function dotIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2.5px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 6px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

export function createMarkerIcon(risco: RiscoNivel): L.DivIcon {
  return dotIcon(RISCO_COLORS[risco]);
}

// Marcador colorido por IEOP. Defensivo: sem score, cai para a cor de risco.
export function createMarkerIconByIEOP(
  score: number | null | undefined,
  risco: RiscoNivel,
): L.DivIcon {
  if (score == null) return dotIcon(RISCO_COLORS[risco]);
  return dotIcon(getIEOPColor(score));
}

export function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 100 ? 42 : 48;
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:#1e2436;border:2px solid #2a2f42;
      border-radius:50%;display:flex;align-items:center;
      justify-content:center;color:#e8eaf0;
      font-size:13px;font-weight:600;font-family:Inter,sans-serif;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    ">${count}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function filterObras(obras: ObraMapPoint[], filter: MapFilter): ObraMapPoint[] {
  return obras.filter((o) => {
    if (filter.risco !== "todos" && getRiscoNivel(o.prob_atraso) !== filter.risco) return false;
    if (filter.secretaria !== "todas" && o.secretaria !== filter.secretaria) return false;
    if (filter.status !== "todos" && o.status !== filter.status) return false;
    return true;
  });
}

function escapeField(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportToCsv(obras: ObraMapPoint[]): void {
  const headers = [
    "Nome",
    "Secretaria",
    "Status",
    "Execução %",
    "Prob. Atraso %",
    "Fornecedor",
    "Lat",
    "Lng",
  ];
  const rows = obras.map((o) => [
    o.nome,
    o.secretaria,
    o.status,
    o.execucao_percentual.toFixed(1),
    (o.prob_atraso * 100).toFixed(0),
    o.fornecedor,
    o.lat,
    o.lng,
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeField).join(",")).join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `obras_macae_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getUniqueSecretarias(obras: ObraMapPoint[]): string[] {
  return [...new Set(obras.map((o) => o.secretaria))].sort();
}
