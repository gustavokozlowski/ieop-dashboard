import { BitmapLayer, ColumnLayer, DeckGL, TileLayer } from "deck.gl";
import { useMemo, useState } from "react";
import type { ObraMapPoint } from "../../schemas/mapa.schema";
import { formatBRL } from "../dashboard/formatters";
import { getIEOPColor, IEOP_COLORS } from "../dashboard/ieop";
import type { RiscoNivel } from "./types";
import { RISCO_COLORS, RISCO_LABELS, STATUS_LABELS } from "./types";

// Macaé / RJ. Pitch alto para destacar as colunas extrudadas.
const INITIAL_VIEW_STATE = {
  longitude: -41.8,
  latitude: -22.39,
  zoom: 11,
  pitch: 50,
  bearing: -10,
};

const MAX_ELEVATION = 3500; // metros (após normalização)

const IEOP_CLASSES = ["Ótimo", "Bom", "Regular", "Ruim", "Crítico"] as const;

type ElevateBy = "valor" | "risco" | "ieop";

const ELEVATE_LABELS: Record<ElevateBy, string> = {
  valor: "Valor",
  risco: "Risco",
  ieop: "IEOP",
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function riscoNivel(prob: number): RiscoNivel {
  if (prob >= 0.7) return "alto";
  if (prob >= 0.4) return "medio";
  return "baixo";
}

interface Mapa3DProps {
  obras: ObraMapPoint[];
}

export function Mapa3D({ obras }: Mapa3DProps) {
  const [elevateBy, setElevateBy] = useState<ElevateBy>("valor");

  const maxValor = useMemo(() => Math.max(1, ...obras.map((o) => o.valor_contratado)), [obras]);

  const elevation = (o: ObraMapPoint): number => {
    if (elevateBy === "valor") return (o.valor_contratado / maxValor) * MAX_ELEVATION;
    if (elevateBy === "risco") return o.prob_atraso * MAX_ELEVATION;
    return ((o.ieop_score ?? 0) / 100) * MAX_ELEVATION;
  };

  // Cor acompanha a métrica: IEOP usa a paleta IEOP; valor/risco usam o nível de risco.
  const fillColor = (o: ObraMapPoint): [number, number, number, number] => {
    const hex =
      elevateBy === "ieop" ? getIEOPColor(o.ieop_score) : RISCO_COLORS[riscoNivel(o.prob_atraso)];
    const [r, g, b] = hexToRgb(hex);
    return [r, g, b, 210];
  };

  // Basemap OSM (raster, sem token) renderizado pelo próprio deck.gl.
  const basemap = new TileLayer({
    id: "osm-basemap",
    data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    // deck.gl tipa o sublayer de forma genérica; usamos a bounding box do tile.
    renderSubLayers: (props: any) => {
      const [[west, south], [east, north]] = props.tile.boundingBox;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north] as [number, number, number, number],
      });
    },
  });

  const colunas = new ColumnLayer<ObraMapPoint>({
    id: "obras-3d",
    data: obras,
    diskResolution: 12,
    radius: 70,
    extruded: true,
    pickable: true,
    elevationScale: 1,
    getPosition: (o): [number, number] => [o.lng, o.lat],
    getElevation: elevation,
    getFillColor: fillColor,
    material: true,
    updateTriggers: {
      getElevation: [elevateBy, maxValor],
      getFillColor: [elevateBy],
    },
  });

  const legenda =
    elevateBy === "ieop"
      ? IEOP_CLASSES.map((c) => ({ label: c, color: IEOP_COLORS[c]?.hex ?? "#555b72" }))
      : (["alto", "medio", "baixo"] as RiscoNivel[]).map((r) => ({
          label: RISCO_LABELS[r],
          color: RISCO_COLORS[r],
        }));

  return (
    <div
      style={{
        position: "relative",
        height: "72vh",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
      }}
    >
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={[basemap, colunas]}
        getTooltip={(info: any) => {
          const o = info.object as ObraMapPoint | undefined;
          if (!o) return null;
          const ieop =
            o.ieop_score != null
              ? `<br/>IEOP ${o.ieop_score.toFixed(1)} (${o.ieop_classe ?? "—"})`
              : "";
          return {
            html: `<strong>${o.nome}</strong><br/>${o.secretaria}<br/>${
              STATUS_LABELS[o.status]
            } · ${formatBRL(o.valor_contratado)} · ${RISCO_LABELS[riscoNivel(o.prob_atraso)]}${ieop}`,
            style: {
              background: "#161b27",
              border: "1px solid #2a2f42",
              borderRadius: "8px",
              color: "#e8eaf0",
              fontSize: "12px",
              padding: "8px 10px",
              maxWidth: "260px",
            },
          };
        }}
      />

      {/* Controles + legenda sobre o mapa */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          background: "rgba(22,27,39,0.92)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
            Altura por:
          </span>
          {(["valor", "risco", "ieop"] as ElevateBy[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setElevateBy(m)}
              style={{
                fontSize: "var(--text-xs)",
                padding: "2px 10px",
                borderRadius: "999px",
                cursor: "pointer",
                border: `1px solid ${elevateBy === m ? "var(--color-info-border)" : "var(--color-border)"}`,
                background: elevateBy === m ? "var(--color-info-bg)" : "transparent",
                color: elevateBy === m ? "var(--color-info)" : "var(--color-text-secondary)",
              }}
            >
              {ELEVATE_LABELS[m]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {legenda.map((item) => (
            <span
              key={item.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "var(--text-xs)",
                color: "var(--color-text-secondary)",
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 2, background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
