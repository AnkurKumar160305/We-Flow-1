import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Avatar } from "../components/Avatar";
import { DeptTag } from "../components/DeptTag";
import { Layout } from "../components/Layout";
import { useTeamHealth, useTeamMembers } from "../hooks/useBackend";
import type { WorkspaceMember } from "../types";

function MemberCard({ member }: { member: WorkspaceMember }) {
  const completionRate =
    member.tasksCompleted &&
    member.tasksCompleted + (member.tasksInProgress ?? 0) > 0
      ? Math.round(
          (member.tasksCompleted /
            (member.tasksCompleted + (member.tasksInProgress ?? 0))) *
            100,
        )
      : 0;

  return (
    <div
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-elevated transition-smooth"
      data-ocid={`member-card-${member.id}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          initials={member.initials}
          name={member.name}
          size="lg"
          isOnline={member.isOnline}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-sm truncate">
              {member.name}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                member.role === "admin" || member.role === "owner"
                  ? "text-primary border-primary/40 bg-primary/5"
                  : "text-muted-foreground",
              )}
            >
              {member.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {member.email}
          </p>
          {member.departmentId && (
            <div className="mt-1.5">
              <DeptTag departmentId={member.departmentId} />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-base font-bold text-foreground">
            {member.tasksCompleted ?? 0}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-base font-bold text-foreground">
            {member.tasksInProgress ?? 0}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            In Progress
          </p>
        </div>
      </div>

      {/* Completion bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">
            Completion rate
          </span>
          <span className="text-[10px] font-semibold text-primary">
            {completionRate}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const { data: members = [] } = useTeamMembers();
  const { data: health } = useTeamHealth();

  const onlineCount = members.filter((m) => m.isOnline).length;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">
                Team
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {members.length} members · {onlineCount} online now
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 gap-1.5"
              size="sm"
              data-ocid="invite-member-btn"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Health summary */}
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Team Health:
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    (health?.overallScore ?? 0) >= 70
                      ? "text-green-600 dark:text-green-400"
                      : "text-orange-600 dark:text-orange-400",
                  )}
                >
                  {health?.overallScore ?? 74}/100
                </span>
              </div>
              {[
                {
                  icon: CheckCircle2,
                  label: "On Track",
                  value: health?.onTrackCount ?? 7,
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: AlertTriangle,
                  label: "Blocked",
                  value: health?.blockedCount ?? 1,
                  color: "text-red-500 dark:text-red-400",
                },
                {
                  icon: Clock,
                  label: "Velocity",
                  value: `${health?.completionRate ?? 25}%`,
                  color: "text-primary",
                },
                {
                  icon: TrendingUp,
                  label: "Trend",
                  value:
                    health?.velocityTrend === "up"
                      ? "↑ Up"
                      : health?.velocityTrend === "down"
                        ? "↓ Down"
                        : "→ Stable",
                  color: "text-green-600 dark:text-green-400",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm">
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-muted-foreground">{label}:</span>
                  <span className={cn("font-semibold", color)}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Member grid */}
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
