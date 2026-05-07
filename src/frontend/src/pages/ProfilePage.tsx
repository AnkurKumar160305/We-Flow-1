import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "../components/Layout";
import { MOCK_TASKS, MOCK_MEMBERS } from "../data/mockData";
import { useProfile } from "../hooks/useBackend";
import { 
  CalendarDays, 
  Briefcase, 
  User,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Save,
  X,
  LogOut
} from "lucide-react";
import { DEPARTMENTS } from "../types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../hooks/useAuthStore";

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  if (!profile) return null;
  const memberData = MOCK_MEMBERS.find(m => m.id === profile.id);
  
  const roleLabel = profile.role === "admin" ? "Creator" : "Co-creator";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [tempName, setTempName] = useState(profile.name || "");
  const [role, setRole] = useState(roleLabel);
  const [tempRole, setTempRole] = useState(roleLabel);
  const [bio, setBio] = useState(profile.bio || "");
  const [tempBio, setTempBio] = useState(profile.bio || "");

  const joinDate = new Date(profile.joinDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const department = DEPARTMENTS.find((d) => d.id === profile.departmentId);
  
  // Calculate stats for the bottom section
  const totalTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id).length;
  const doneTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id && t.status === "done").length;
  const doingTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id && t.status === "doing").length;
  const blockedTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id && t.status === "blocked").length;
  const todoTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id && t.status === "todo").length;
  const recentTasks = MOCK_TASKS.filter(t => t.assigneeId === profile.id).slice(0, 3);

  function handleSave() {
    setName(tempName);
    setRole(tempRole);
    setBio(tempBio);
    setIsEditing(false);
  }

  function handleCancel() {
    setTempName(name);
    setTempRole(role);
    setTempBio(bio);
    setIsEditing(false);
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-[#F8F9FB] p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Top Section: Profile Header + Bio (Merged as requested) */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative space-y-8">
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className={cn(
                  "p-2 rounded-full hover:bg-primary/10 transition-all",
                  isEditing ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary"
                )}
                title="Edit Profile"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  logout();
                  navigate({ to: "/onboarding" });
                }}
                className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Left: Large Profile Image/Avatar Box */}
              <div className="w-48 h-48 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-6xl shadow-inner flex-shrink-0">
                {profile.initials}
              </div>
              
              {/* Right: Details (Name, Role, Joining Date) */}
              <div className="flex-1 py-2 space-y-4">
                 <div>
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <Input 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="text-4xl font-bold font-display h-14"
                        placeholder="Your Name"
                      />
                      <Input 
                        value={tempRole}
                        onChange={(e) => setTempRole(e.target.value)}
                        className="text-2xl font-semibold text-primary h-10"
                        placeholder="Your Role (e.g. Creator)"
                      />
                    </div>
                  ) : (
                    <h1 className="text-4xl font-bold font-display text-foreground">
                      {name} <span className="text-muted-foreground font-normal mx-2">-</span> 
                      <span className="text-primary text-2xl font-semibold inline-flex items-center">
                        {role}
                      </span>
                    </h1>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg text-muted-foreground">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{department?.name || "Member"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-lg text-muted-foreground">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Joining Date: {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Merged Bio Area (Inside Top Box) */}
            <div className="pt-6 border-t border-border">
              {!isEditing && (
                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground font-medium leading-relaxed italic">
                    "{bio}"
                  </p>
                </div>
              )}
              
              {isEditing && (
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Update Bio</span>
                  </div>
                  <Input 
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="text-lg italic bg-background"
                    placeholder="Tell us about yourself..."
                    autoFocus
                  />
                  <div className="flex items-center gap-2 justify-end mt-4">
                    <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2">
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="gap-2 bg-primary">
                      <Save className="w-4 h-4" /> Save Bio
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Large Container (Stats & Activity) */}
          <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm space-y-12">
            {/* Personal Stats Grid */}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
                <LayoutGrid className="w-4 h-4" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-1">
                  <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Tasks</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center space-y-1">
                  <p className="text-3xl font-bold text-green-700">{doneTasks}</p>
                  <p className="text-[10px] text-green-600/80 uppercase font-bold tracking-widest">Completed</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-1">
                  <p className="text-3xl font-bold text-blue-700">{doingTasks}</p>
                  <p className="text-[10px] text-blue-600/80 uppercase font-bold tracking-widest">Doing</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center space-y-1">
                  <p className="text-3xl font-bold text-red-700">{blockedTasks}</p>
                  <p className="text-[10px] text-red-600/80 uppercase font-bold tracking-widest">Blocked</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2 px-1">
                <Clock className="w-4 h-4" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentTasks.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-5 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        task.status === 'done' ? "bg-green-100 text-green-600" :
                        task.status === 'blocked' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {task.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
                         task.status === 'blocked' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Updated on {new Date(task.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize px-3 py-0.5 rounded-full bg-background">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
