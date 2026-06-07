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
