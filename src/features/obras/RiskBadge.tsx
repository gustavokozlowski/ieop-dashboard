import type { BadgeVariant } from "../../components/Badge";
import { Badge } from "../../components/Badge";
import { getRiscoNivel } from "../mapa/mapaUtils";
import type { RiscoNivel } from "../mapa/types";

const VARIANT: Record<RiscoNivel, BadgeVariant> = {
  alto: "danger",
  medio: "warning",
  baixo: "success",
};

const LABEL: Record<RiscoNivel, string> = {
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export function RiskBadge({ prob }: { prob: number }) {
  const nivel = getRiscoNivel(prob);
  return <Badge label={LABEL[nivel]} variant={VARIANT[nivel]} dot={false} />;
}
