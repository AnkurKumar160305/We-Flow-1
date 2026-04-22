import { cn } from "@/lib/utils";
import type { DepartmentColor } from "../types";
import { DEPARTMENTS, DEPT_COLORS } from "../types";

interface DeptTagProps {
  departmentId: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DeptTag({
  departmentId,
  showLabel = true,
  size = "sm",
  className,
}: DeptTagProps) {
  const dept = DEPARTMENTS.find((d) => d.id === departmentId);
  if (!dept) return null;

  const colors = DEPT_COLORS[dept.color];

  if (!showLabel) {
    return (
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          size === "sm" ? "w-2 h-2" : "w-3 h-3",
          colors.dot,
          className,
        )}
        title={dept.name}
        aria-label={dept.name}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        colors.bg,
        colors.text,
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
          colors.dot,
        )}
      />
      {dept.abbreviation}
    </span>
  );
}

interface ColorDotProps {
  color: DepartmentColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorDot({ color, size = "sm", className }: ColorDotProps) {
  const sizeMap = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
  return (
    <span
      className={cn(
        "rounded-full flex-shrink-0 inline-block",
        sizeMap[size],
        DEPT_COLORS[color].dot,
        className,
      )}
    />
  );
}
