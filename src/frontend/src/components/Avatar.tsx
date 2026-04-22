import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

const AVATAR_COLORS = [
  "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  "bg-green-500/15 text-green-700 dark:text-green-300",
  "bg-pink-500/15 text-pink-700 dark:text-pink-300",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300",
];

function getColorIndex(initials: string): number {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

interface AvatarProps {
  initials: string;
  avatarUrl?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  isOnline?: boolean;
}

export function Avatar({
  initials,
  avatarUrl,
  name,
  size = "md",
  className,
  isOnline,
}: AvatarProps) {
  const colorClass = AVATAR_COLORS[getColorIndex(initials)];

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? initials}
          className={cn("rounded-full object-cover", SIZE_CLASSES[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-display font-semibold select-none",
            SIZE_CLASSES[size],
            colorClass,
          )}
          title={name}
          aria-label={name ?? initials}
        >
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-card",
            size === "xs" || size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
            isOnline ? "bg-green-500" : "bg-muted-foreground/40",
          )}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ initials: string; avatarUrl?: string; name?: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = "sm",
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((a) => (
        <Avatar
          key={a.initials + (a.name ?? "")}
          initials={a.initials}
          avatarUrl={a.avatarUrl}
          name={a.name}
          size={size}
          className="ring-2 ring-card"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-[9px] font-semibold bg-muted text-muted-foreground ring-2 ring-card",
            SIZE_CLASSES[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
