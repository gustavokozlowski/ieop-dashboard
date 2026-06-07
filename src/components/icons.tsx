// IEOP · Ícones SVG (stroke = currentColor) — substituem os glifos unicode.
// Traços compatíveis com lucide-react; mantidos inline para zerar dependência.
import type { SVGProps } from "react";

const stroke: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const box = (props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 24 24",
  ...stroke,
  ...props,
});

// ── Emblema de marca (preenchido) ──
export function LogoIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="url(#ieop-logo-grad)" />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="10.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.1"
      />
      <path
        d="M9 27.5 L16.5 20 L23 24 L31 12"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="12" r="2.7" fill="#fff" />
      <circle cx="9" cy="27.5" r="1.8" fill="#fff" fillOpacity="0.55" />
      <defs>
        <linearGradient
          id="ieop-logo-grad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2FBE90" />
          <stop offset="1" stopColor="#168A63" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Navegação ──
export const DashboardIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const ObrasIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M3 18h18" />
    <path d="M5 18v-7a7 7 0 0 1 14 0v7" />
    <path d="M12 4v4" />
    <path d="M2 18h20v2H2z" />
  </svg>
);

export const FornecedoresIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

export const IAIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 3l1.8 4.8L18.6 9.6 13.8 11.4 12 16.2 10.2 11.4 5.4 9.6 10.2 7.8z" />
    <path d="M19 14l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
  </svg>
);

export const MapaIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const Mapa3DIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 2l9 5v10l-9 5-9-5V7z" />
    <path d="M12 12l9-5M12 12v10M12 12L3 7" />
  </svg>
);

// ── UI ──
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const BellIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const BuildingIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" />
  </svg>
);

export const ActivityIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
);

export const MoneyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.8 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2A2.5 2.5 0 0 1 9.5 16M12 6v1.5M12 16.5V18" />
  </svg>
);

export const GaugeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M4 18a8 8 0 0 1 16 0" />
    <path d="m12 13 4-4" />
    <circle cx="12" cy="14" r="1.4" />
  </svg>
);

export const ArrowUpIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

export const ArrowLeftIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...box(p)}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
