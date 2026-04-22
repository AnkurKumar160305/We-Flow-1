import type { Sprint, WorkspaceMember } from "../types";
import { Avatar } from "./Avatar";
import { TeamHealthWidget } from "./TeamHealthWidget";

interface RightSidebarProps {
  members: WorkspaceMember[];
  activeSprint: Sprint | undefined;
  shippedCount: number;
  totalCount: number;
}

const DISPLAY_MEMBERS: Array<{
  id: string;
  name: string;
  initials: string;
  title: string;
}> = [
  { id: "user-1", name: "Ayyaar", initials: "AY", title: "Founder & CEO" },
  { id: "user-2", name: "Rahul S.", initials: "RS", title: "Developer" },
  { id: "user-3", name: "Priya M.", initials: "PM", title: "UI/UX Designer" },
  { id: "user-4", name: "Vikram K.", initials: "VK", title: "Marketing" },
  { id: "user-5", name: "Neha R.", initials: "NR", title: "Operations" },
];

export function RightSidebar({
  members,
  activeSprint,
  shippedCount,
  totalCount,
}: RightSidebarProps) {
  // Merge DISPLAY_MEMBERS display names/titles with online status from members prop
  const mergedMembers = DISPLAY_MEMBERS.map((dm) => {
    const live = members.find((m) => m.id === dm.id);
    return { ...dm, isOnline: live?.isOnline ?? false };
  });
  return (
    <aside
      className="w-[220px] flex-shrink-0 bg-card border-l border-border flex flex-col h-full overflow-y-auto"
      data-ocid="right-sidebar"
    >
      {/* TEAM HEALTH */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3">
          Team Health
        </p>
        <TeamHealthWidget momentum={13} clarity={85} velocity={4.2} />
      </div>

      <div className="mx-4 h-px bg-border" />

      {/* SPRINT info */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">
          Sprint
        </p>
        {activeSprint ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {activeSprint.name}
            </p>
            {activeSprint.goalSummary && (
              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                {activeSprint.goalSummary}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-xs font-bold text-primary">
                {shippedCount} shipped
              </span>
              <span className="text-xs text-muted-foreground">
                / {totalCount} total
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width:
                    totalCount > 0
                      ? `${(shippedCount / totalCount) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No active sprint</p>
        )}
      </div>

      <div className="mx-4 h-px bg-border" />

      {/* TEAM */}
      <div className="px-4 py-3 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">
          Team
        </p>
        <div className="flex flex-col gap-1">
          {mergedMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 py-1 rounded-md hover:bg-muted/50 transition-colors px-1 -mx-1 cursor-pointer"
              data-ocid={`team-member-${member.id}`}
            >
              <Avatar initials={member.initials} name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {member.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-none">
                  {member.title}
                </p>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground bg-muted rounded px-1 py-0.5 flex-shrink-0">
                CC
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
