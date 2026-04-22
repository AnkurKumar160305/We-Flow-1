import { cn } from "@/lib/utils";
interface CircleProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

function CircleProgress({
  value,
  size = 72,
  strokeWidth = 6,
  color = "oklch(0.62 0.22 40)",
  label,
  sublabel,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${value}%`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground leading-none">
            {value}%
          </span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground leading-tight">
            {label}
          </p>
          {sublabel && (
            <p className="text-[10px] text-muted-foreground leading-tight">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface TeamHealthWidgetProps {
  momentum: number;
  clarity: number;
  velocity: number;
}

export function TeamHealthWidget({
  momentum,
  clarity,
  velocity,
}: TeamHealthWidgetProps) {
  return (
    <div className="space-y-3">
      {/* Circle progress for momentum */}
      <div className="flex justify-center pt-1">
        <CircleProgress
          value={momentum}
          size={80}
          strokeWidth={7}
          label="Momentum"
          sublabel="Team energy index"
        />
      </div>

      {/* Clarity & Velocity bars */}
      <div className="space-y-2 pt-1">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-foreground">Clarity</span>
            <span className="text-xs font-bold text-primary">{clarity}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${clarity}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-foreground">
              Velocity
            </span>
            <span className="text-xs font-bold text-primary">{velocity}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(velocity / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
