import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronDown,
  Circle,
  Download,
  Flag,
  Moon,
  Plus,
  Smartphone,
  Sun,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useMilestones, useWorkspace } from "../hooks/useBackend";
import type { Sprint } from "../types";

interface LeftSidebarProps {
  sprints: Sprint[];
  activeSprint: string;
  onSelectSprint: (sprintId: string) => void;
  onNewSprint: () => void;
}

const BUCKET_ITEMS_STATIC = [
  { id: "csv-export", label: "CSV export", icon: Download },
  { id: "mobile", label: "Mobile layout", icon: Smartphone },
  { id: "zapier", label: "Zapier integration", icon: Zap },
];

export function LeftSidebar({
  sprints,
  activeSprint,
  onSelectSprint,
  onNewSprint,
}: LeftSidebarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const navigate = useNavigate();
  const { data: workspace } = useWorkspace();
  const { data: milestones = [] } = useMilestones(workspace?.id ?? "default");

  // Collect all active/ongoing sprints across milestones
  const ongoingSprints = milestones.flatMap((m) =>
    m.sprints
      .filter((s) => s.status === "active" || s.status === "upcoming")
      .map((s) => ({ ...s, milestoneName: m.name })),
  );

  const sortedSprints = [...sprints].sort((a, b) => {
    const order: Record<string, number> = {
      active: 0,
      upcoming: 1,
      completed: 2,
    };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  function fmtDateShort(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <aside
      className="w-[220px] flex-shrink-0 bg-card border-r border-border flex flex-col h-full overflow-y-auto"
      data-ocid="left-sidebar"
    >
      {/* SPRINTS section */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-2 mb-2">
          Sprints
        </p>
        <div className="flex flex-col gap-0.5">
          {sortedSprints.map((sprint) => {
            const isActive = sprint.id === activeSprint;
            return (
              <button
                key={sprint.id}
                type="button"
                onClick={() => onSelectSprint(sprint.id)}
                className={cn(
                  "flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted font-medium",
                )}
                data-ocid={`sidebar-sprint-${sprint.id}`}
              >
                <span className="truncate">{sprint.name}</span>
                {sprint.status === "active" && (
                  <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground border-0 font-semibold ml-1 flex-shrink-0">
                    Live
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onNewSprint}
          className="flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 mt-1 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors font-medium"
          data-ocid="sidebar-new-sprint"
        >
          <Plus className="w-3.5 h-3.5" />
          New sprint
        </button>
      </div>

      <div className="mx-3 my-2 h-px bg-border" />

      {/* MILESTONES section */}
      <div className="px-3 py-2">
        <button
          type="button"
          onClick={() => setMilestonesOpen((v) => !v)}
          className="flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm font-semibold transition-colors hover:bg-muted group"
          data-ocid="sidebar-milestones-toggle"
          aria-expanded={milestonesOpen}
        >
          <div className="flex items-center gap-2">
            <Flag className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">Milestones</span>
          </div>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
              milestonesOpen && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown — ongoing sprints */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            milestonesOpen
              ? "max-h-[300px] opacity-100 mt-1"
              : "max-h-0 opacity-0",
          )}
        >
          {ongoingSprints.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted-foreground italic">
              No ongoing sprints
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 ml-1">
              {ongoingSprints.map((sprint) => (
                <button
                  key={sprint.id}
                  type="button"
                  onClick={() => navigate({ to: "/milestones" })}
                  className="flex flex-col items-start w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors hover:bg-primary/5 hover:text-primary group"
                  data-ocid={`sidebar-milestone-sprint-${sprint.id}`}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="font-semibold text-foreground group-hover:text-primary truncate">
                      {sprint.name}
                    </span>
                    <Badge
                      className={cn(
                        "text-[8px] px-1 py-0 h-3.5 border-0 flex-shrink-0 font-semibold",
                        sprint.status === "active"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {sprint.status === "active" ? "Active" : "Soon"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <CalendarDays className="w-2.5 h-2.5" />
                    <span className="text-[10px]">
                      {fmtDateShort(sprint.startDate)} –{" "}
                      {fmtDateShort(sprint.endDate)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                    {sprint.milestoneName}
                  </span>
                </button>
              ))}
            </div>
          )}
          {/* Navigate to milestones page */}
          <button
            type="button"
            onClick={() => navigate({ to: "/milestones" })}
            className="flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 mt-1 rounded-md text-xs text-primary hover:bg-primary/5 transition-colors font-semibold"
            data-ocid="sidebar-milestones-page-link"
          >
            <Flag className="w-3 h-3" />
            View all milestones
          </button>
        </div>
      </div>

      <div className="mx-3 my-2 h-px bg-border" />

      {/* TASK BUCKET section */}
      <div className="px-3 py-2 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-2 mb-2">
          Task Bucket
        </p>
        <div className="flex flex-col gap-0.5">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors group",
              isDark
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted",
            )}
            data-ocid="sidebar-bucket-dark-mode"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "truncate font-medium",
                  isDark ? "text-primary" : "",
                )}
              >
                {isDark ? "Light mode" : "Dark mode theme"}
              </span>
            </div>
            {/* Toggle pill */}
            <div
              className={cn(
                "w-8 h-4 rounded-full flex-shrink-0 relative transition-colors duration-300",
                isDark ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-card shadow-sm transition-all duration-300",
                  isDark ? "left-4" : "left-0.5",
                )}
              />
            </div>
          </button>

          {BUCKET_ITEMS_STATIC.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors group"
              data-ocid={`sidebar-bucket-${id}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Circle className="w-3 h-3 text-muted-foreground" />
                <Plus className="w-3 h-3 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs text-primary hover:text-primary hover:bg-primary/5 px-2.5 w-full justify-start font-medium"
          data-ocid="sidebar-add-bucket"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add to bucket
        </Button>
      </div>
    </aside>
  );
}
