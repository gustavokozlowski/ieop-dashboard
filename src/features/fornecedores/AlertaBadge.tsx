import { Badge } from "../../components/Badge";
import { ALERTA_THRESHOLD } from "./types";

interface AlertaBadgeProps {
  taxa: number; // 0–1
}

export function AlertaBadge({ taxa }: AlertaBadgeProps) {
  if (taxa <= ALERTA_THRESHOLD) return null;
  return <Badge label={`⚠ ${(taxa * 100).toFixed(0)}% aditivos`} variant="danger" dot={false} />;
}
