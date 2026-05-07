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
  Mail,
  User,
  Shield,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Layout } from "../components/Layout";
import { useTeamMembers, useInviteMember, useDeleteTeamMember, useUpdateTeamMember } from "../hooks/useBackend";
import type { WorkspaceMember } from "../types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

// ─── Attractive Add Member Bar ──────────────────────────────────────────────

function AddMemberBar() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState("co-creator");
  const inviteMember = useInviteMember();

  async function handleSendInvite() {
    if (!email) return;
    await inviteMember.mutateAsync({ email, name, role, jobTitle } as any);
    setEmail("");
    setName("");
    setJobTitle("");
    setRole("co-creator");
  }

  return (
    <div className="w-full px-6 pt-2 pb-6">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-black text-orange-600/80 uppercase tracking-[0.15em] ml-2">Add Team Member</span>
        <div className="flex items-center gap-5">
          <div className="flex-1 relative group">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex-1 relative group">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex-1 relative group">
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Role (e.g. Designer)"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="w-[240px] relative group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="co-creator">co-creator</option>
              <option value="creator">creator</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
          <button
            onClick={handleSendInvite}
            disabled={inviteMember.isPending || !email}
            className="h-14 px-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {inviteMember.isPending ? "Inviting..." : "Send Invite"}
          </button>
        </div>
      </div>
      <div className="mt-12 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent w-full" />
    </div>
  );
}

// ─── Attractive Member Row ──────────────────────────────────────────────────

function MemberRow({ member, index }: { member: WorkspaceMember, index: number }) {
  const deleteMember = useDeleteTeamMember();

  return (
    <div className="flex items-center gap-6 py-5 px-6 rounded-[1.5rem] bg-white hover:bg-orange-50/40 shadow-sm hover:shadow-md transition-all group/row border border-gray-100 hover:border-orange-200">
      <div className="flex items-center gap-4 w-[200px] flex-shrink-0">
        <span className="text-[15px] font-black text-gray-300 w-6 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <span className="text-[15px] font-bold text-gray-900 truncate group-hover/row:text-orange-600 transition-colors">{member.name}</span>
      </div>
      
      <div className="w-[240px] flex-shrink-0">
        <span className="text-[14px] font-semibold text-gray-600 italic truncate block">{(member as any).jobTitle || "ui/ux-graphic designer"}</span>
      </div>

      <div className="w-[140px] flex-shrink-0">
        <span className="text-[14px] font-bold text-gray-700 capitalize">{member.role}</span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium text-gray-500 truncate block">{member.email}</span>
      </div>

      <div className="w-[120px] flex-shrink-0 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          member.status === "accepted" ? "bg-green-500 animate-pulse" : "bg-orange-400"
        )} />
        <span className={cn(
          "text-[13px] font-bold uppercase tracking-wider",
          member.status === "accepted" ? "text-green-600" : "text-orange-500"
        )}>
          {member.status || 'pending'}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="h-10 px-6 bg-white border border-orange-200 text-orange-600 rounded-xl font-bold text-[13px] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm">
          Edit
        </button>
        <button 
          className="h-10 px-6 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-[13px] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
          onClick={() => {
            if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
              deleteMember.mutate(member.id);
            }
          }}
          disabled={deleteMember.isPending}
        >
          {deleteMember.isPending ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Team() {
  const { data: members = [], isLoading } = useTeamMembers();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-full bg-[#FBFBFC] overflow-hidden p-6 md:p-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
          
          {/* Header Decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300" />

          <div className="flex-1 overflow-y-auto px-10 py-10">
            {/* Attractive Add Member Bar */}
            <AddMemberBar />

            <div className="px-10 mb-3 flex items-center gap-6">
               <div className="w-[200px] pl-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Name</div>
               <div className="w-[240px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Title</div>
               <div className="w-[140px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</div>
               <div className="flex-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address</div>
               <div className="w-[120px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
               <div className="w-[200px]"></div> {/* spacer for buttons */}
            </div>

            {/* Members List */}
            <div className="space-y-3 px-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Team...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UserPlus className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-lg font-bold text-gray-400">Your team is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first member to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((m, idx) => (
                    <MemberRow key={m.id} member={m} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Premium Bottom Navigation */}
          <div className="p-10 border-t border-gray-50 flex items-center justify-center gap-8 bg-gray-50/20">
            <button 
              className="group h-14 px-12 border-2 border-gray-200 text-gray-500 rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center gap-3 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/50 transition-all"
              onClick={() => navigate({ to: '/onboarding' })}
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button 
              className="group h-14 px-14 bg-gray-900 text-white rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center gap-3 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Continue
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
