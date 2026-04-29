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
import { useTeamHealth, useTeamMembers, useInviteMember } from "../hooks/useBackend";
import type { WorkspaceMember } from "../types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Member");
  const inviteMember = useInviteMember();

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await inviteMember.mutateAsync({ email, name, role });
    onClose();
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-none w-full h-full m-0"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-card rounded-xl shadow-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Invite Member</h2>
            <p className="text-sm text-muted-foreground mt-1">Add a co-creator or member to your team.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@startup.com"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Name (Optional)</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Co-creator">Co-creator</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={inviteMember.isPending}>
              {inviteMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

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
  const { data: members = [], isLoading } = useTeamMembers();
  const { data: health } = useTeamHealth();
  const [showInviteModal, setShowInviteModal] = useState(false);

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
              onClick={() => setShowInviteModal(true)}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No team members yet.</p>
              <Button variant="link" className="text-primary mt-2" onClick={() => setShowInviteModal(true)}>
                Invite your first member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} />}
    </Layout>
  );
}
