import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LogOut, Moon, Shield, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../hooks/useAuthStore";
import { MOCK_WORKSPACE } from "../data/mockData";
import { useProfile } from "../hooks/useBackend";

interface ProfilePanelProps {
  isDark: boolean;
  onToggleDark: () => void;
  onClose: () => void;
}

interface SectionHeadingProps {
  icon: React.ElementType;
  label: string;
}

function SectionHeading({ icon: Icon, label }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function ProfilePanel({
  isDark,
  onToggleDark,
  onClose,
}: ProfilePanelProps) {
  const { data: profile } = useProfile();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState(profile?.name || "Guest");
  const [title, setTitle] = useState("Founder & CEO");
  const [bio, setBio] = useState(
    "Building WeFlow to help teams ship faster with less friction.",
  );
  const [jobRole, setJobRole] = useState("Product Lead");
  const [workspaceName, setWorkspaceName] = useState(MOCK_WORKSPACE.name);
  const [tagline, setTagline] = useState(
    MOCK_WORKSPACE.description ?? "The nHive product team workspace",
  );
  const [creatorMode, setCreatorMode] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
        data-ocid="profile.dialog"
      />

      {/* Slide-in panel — fixed to the RIGHT edge of the viewport */}
      {/* Use inline style for position:fixed so native <dialog> can't override it */}
      <dialog
        open
        aria-modal="true"
        aria-label="User profile"
        className={cn(
          "m-0 p-0 w-full max-w-[400px] bg-card border-l border-border shadow-2xl flex flex-col z-50",
          "animate-in slide-in-from-right duration-300",
        )}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: "auto",
          bottom: 0,
          height: "100dvh",
          margin: 0,
          maxHeight: "100dvh",
          border: "none",
        }}
      >
        {/* Top strip — avatar + name */}
        <div className="relative bg-primary/8 border-b border-border px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close profile panel"
            data-ocid="profile.close_button"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Large avatar */}
          <div className="flex items-center gap-4">
            {/* Large avatar - Editable */}
            <div 
              className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl flex-shrink-0 shadow-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
              onClick={() => document.getElementById('profile-logo-upload')?.click()}
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.initials
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input 
                id="profile-logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64 = reader.result;
                    try {
                      await axios.put(`${BASE_URL}/api/auth/profile`, { profile_logo: base64 }, {
                        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
                      });
                      window.location.reload();
                    } catch (err) {
                      console.error("Logo update failed", err);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div>
              <p className="text-base font-bold font-display text-foreground leading-tight">
                {profile?.name}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
              <div className="mt-1.5">
                <Badge className="bg-primary/15 text-primary border-0 text-[10px] font-semibold px-2 py-0.5">
                  Creator
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* MY PROFILE */}
          <section data-ocid="profile.section">
            <SectionHeading icon={User} label="My Profile" />
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="profile-fullname"
                  className="text-xs mb-1.5 block"
                >
                  Full Name
                </Label>
                 <Input
                  id="profile-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="profile.full_name.input"
                />


              </div>
              <div>
                <Label htmlFor="profile-title" className="text-xs mb-1.5 block">
                  Title
                </Label>
                 <Input
                  id="profile-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="profile.title.input"
                />


              </div>
              <div>
                <Label htmlFor="profile-bio" className="text-xs mb-1.5 block">
                  Bio
                </Label>
                 <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="text-sm min-h-[72px] resize-none"
                  data-ocid="profile.bio.textarea"
                />


              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Access Type</Label>
                  <div className="h-8 px-3 flex items-center rounded-md border border-input bg-muted text-sm text-muted-foreground">
                    Creator
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="profile-jobrole"
                    className="text-xs mb-1.5 block"
                  >
                    Job Role
                  </Label>
                   <Input
                    id="profile-jobrole"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="h-8 text-sm"
                    data-ocid="profile.job_role.input"
                  />


                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* APPEARANCE */}
          <section data-ocid="profile.appearance.section">
            <SectionHeading icon={Moon} label="Appearance" />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={onToggleDark}
                data-ocid="profile.dark_mode.toggle"
              />
            </div>
          </section>

          <Separator />

          {/* MODE PREVIEW */}
          <section data-ocid="profile.mode.section">
            <SectionHeading icon={Shield} label="Mode Preview" />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Creator Mode
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Access all workspace management tools
                </p>
              </div>
              <Switch
                checked={creatorMode}
                onCheckedChange={setCreatorMode}
                data-ocid="profile.creator_mode.toggle"
              />
            </div>
          </section>

          <Separator />

          {/* ACCOUNT */}
          <section data-ocid="profile.account.section">
            <SectionHeading icon={User} label="Account" />
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1.5 block">Email</Label>
                <div className="h-8 px-3 flex items-center rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  {profile?.email}
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Member Since</Label>
                <div className="h-8 px-3 flex items-center rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  January 10, 2026
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* WORKSPACE SETTINGS */}
          <section data-ocid="profile.workspace.section">
            <SectionHeading icon={Shield} label="Workspace Settings" />
            <div className="space-y-3">
              <div>
                <Label htmlFor="ws-name" className="text-xs mb-1.5 block">
                  Workspace Name
                </Label>
                 <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="profile.workspace_name.input"
                />


              </div>
              <div>
                <Label htmlFor="ws-tagline" className="text-xs mb-1.5 block">
                  Tagline
                </Label>
                 <Input
                  id="ws-tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid="profile.workspace_tagline.input"
                />


              </div>
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSave}
                data-ocid="profile.save_button"
              >
                {saved ? "Saved ✓" : "Save Changes"}
              </Button>
            </div>
          </section>

          <Separator />

          {/* DANGER ZONE */}
          <section className="pb-2" data-ocid="profile.danger.section">
            <SectionHeading icon={LogOut} label="Danger Zone" />
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                logout();
                onClose();
                navigate({ to: "/onboarding" });
              }}
              data-ocid="profile.sign_out_button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </section>
        </div>
      </dialog>
    </>
  );
}
