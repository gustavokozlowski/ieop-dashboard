// IEOP · Ícones. Os de UI vêm do Phosphor, re-exportados por DEEP IMPORT — nunca
// do barril @phosphor-icons/react (que faz o bundler processar ~9000 ícones e
// estoura o build). Só o LogoIcon (emblema da marca) é SVG próprio.

// ── UI / status (substituem emojis) ──
export { ArrowDownIcon } from "@phosphor-icons/react/dist/icons/ArrowDown";
export { ArrowLeftIcon } from "@phosphor-icons/react/dist/icons/ArrowLeft";
export { ArrowUpIcon } from "@phosphor-icons/react/dist/icons/ArrowUp";
export { BuildingsIcon as BuildingIcon } from "@phosphor-icons/react/dist/icons/Buildings";
export { CheckIcon } from "@phosphor-icons/react/dist/icons/Check";
export { CheckCircleIcon } from "@phosphor-icons/react/dist/icons/CheckCircle";
export { CopyIcon } from "@phosphor-icons/react/dist/icons/Copy";
export { DownloadSimpleIcon as DownloadIcon } from "@phosphor-icons/react/dist/icons/DownloadSimple";
export { GaugeIcon } from "@phosphor-icons/react/dist/icons/Gauge";
export { InfoIcon } from "@phosphor-icons/react/dist/icons/Info";
export { ListIcon as MenuIcon } from "@phosphor-icons/react/dist/icons/List";
export { LockIcon } from "@phosphor-icons/react/dist/icons/Lock";
export { MagnifyingGlassIcon as SearchIcon } from "@phosphor-icons/react/dist/icons/MagnifyingGlass";
export { MoneyIcon } from "@phosphor-icons/react/dist/icons/Money";
export { PulseIcon as ActivityIcon } from "@phosphor-icons/react/dist/icons/Pulse";
export { SparkleIcon } from "@phosphor-icons/react/dist/icons/Sparkle";
export { WarningIcon } from "@phosphor-icons/react/dist/icons/Warning";
export { XIcon as CloseIcon } from "@phosphor-icons/react/dist/icons/X";

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
      {/* Phosphor ChartLineUp (viewBox 0 0 256 256), branco e centralizado —
          mesmo ícone do favicon, para identidade consistente. */}
      <g transform="translate(7.5 7.5) scale(0.09765625)" fill="#fff">
        <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z" />
      </g>
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
