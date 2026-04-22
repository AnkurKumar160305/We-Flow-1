interface WeFlowLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  centered?: boolean;
}

const sizes = {
  sm: { icon: 28, text: "text-base", sub: "text-xs" },
  md: { icon: 36, text: "text-xl", sub: "text-sm" },
  lg: { icon: 48, text: "text-3xl", sub: "text-base" },
};

export function WeFlowLogo({
  size = "md",
  showTagline = false,
  centered = false,
}: WeFlowLogoProps) {
  const s = sizes[size];
  return (
    <div
      className={`flex flex-col items-${centered ? "center" : "start"} gap-0`}
    >
      <div className="flex items-center gap-2">
        {/* Orange diamond/hexagon icon */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 40 40"
          fill="none"
          role="img"
          aria-label="WeFlow icon"
        >
          <rect
            x="6"
            y="6"
            width="28"
            height="28"
            rx="8"
            transform="rotate(0 20 20)"
            fill="oklch(0.62 0.22 40)"
          />
          {/* W letterform built from paths */}
          <path
            d="M11 14 L14.5 26 L18 18 L21.5 26 L25 14"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold font-display text-foreground ${s.text} tracking-tight`}
          >
            WeFlow
          </span>
          <span className="text-xs text-muted-foreground font-body mt-0.5">
            by nHive
          </span>
        </div>
      </div>
      {showTagline && (
        <p className="text-muted-foreground text-sm mt-1 font-body">
          Your startup's workspace
        </p>
      )}
    </div>
  );
}
