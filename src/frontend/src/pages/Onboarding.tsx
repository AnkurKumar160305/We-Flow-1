import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Plus, X, ChevronRight } from "lucide-react";

import { useRef, useState } from "react";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { WeFlowLogo } from "../components/WeFlowLogo";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCreateWorkspace } from "../hooks/useBackend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountData {
  fullName: string;
  email: string;
  password: string;
}

interface ProfileData {
  fullName: string;
  title: string;
  bio: string;
  jobRole: string;
  avatarPreview: string | null;
}

interface WorkspaceData {
  workspaceRole: "Creator" | "Co-creator";
  startupName: string;
  tagline: string;
  logoPreview: string | null;
}

interface TeamInvite {
  email: string;
  name: string;
  role: string;
  access: string;
}




// ─── Field components ─────────────────────────────────────────────────────────

function FieldGroup({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">OR</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Step 1: Create account ───────────────────────────────────────────────────

function Step1({
  data,
  onChange,
  errors,
  isSignIn,
  onGoogleSuccess,
  onGoogleError,
}: {
  data: AccountData;
  onChange: (d: Partial<AccountData>) => void;
  errors: Partial<AccountData>;
  isSignIn: boolean;
  onGoogleSuccess: (res: any) => void;
  onGoogleError: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-display text-foreground">
          {isSignIn ? "Sign in to WeFlow" : "Create your account"}
        </h2>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
        />
      </div>

      <OrDivider />

      {!isSignIn && (
        <FieldGroup label="Full Name" htmlFor="full-name" error={errors.fullName}>
          <Input
            id="full-name"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Alex Johnson"
            autoFocus
            data-ocid="account-name-input"
          />
        </FieldGroup>
      )}

      <FieldGroup label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="alex@startup.com"
          autoFocus={isSignIn}
          data-ocid="account-email-input"
        />
      </FieldGroup>

      <FieldGroup label="Password" htmlFor="password" error={errors.password}>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => onChange({ password: e.target.value })}
          placeholder="Min. 8 characters"
          data-ocid="account-password-input"
        />
      </FieldGroup>

      {isSignIn && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-primary font-medium hover:underline"
            onClick={() => alert("Password reset link sent to your email (Mocked)")}
          >
            Forgot Password?
          </button>
        </div>
      )}
    </div>

  );
}

// ─── Step 2: Profile ──────────────────────────────────────────────────────────

function Step2({
  data,
  onChange,
  errors,
}: {
  data: ProfileData;
  onChange: (d: Partial<ProfileData>) => void;
  errors: Partial<ProfileData>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ avatarPreview: url });
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-display text-foreground">
          Profile Setup
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your profile photo
        </p>
      </div>


       {/* Avatar upload */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex flex-col items-center justify-center gap-1 group"
          data-ocid="avatar-upload-btn"
          aria-label="Upload profile photo"
        >
          {data.avatarPreview ? (
            <img
              src={data.avatarPreview}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <>
              <Camera className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-primary/60 group-hover:text-primary font-medium">
                Upload Photo
              </span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Full Name">
            <Input
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="John Doe"
            />
          </FieldGroup>
          <FieldGroup label="Job Role">
            <Input
              value={data.jobRole}
              onChange={(e) => onChange({ jobRole: e.target.value })}
              placeholder="Product Designer"
            />
          </FieldGroup>
        </div>
        <FieldGroup label="Bio">
          <Textarea
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Tell us about yourself..."
            className="h-20 resize-none"
          />
        </FieldGroup>
      </div>

    </div>

  );
}

// ─── Step 3: Workspace ────────────────────────────────────────────────────────

function Step3({
  data,
  onChange,
  errors,
}: {
  data: WorkspaceData;
  onChange: (d: Partial<WorkspaceData>) => void;
  errors: Partial<WorkspaceData>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ logoPreview: url });
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-display text-foreground">
          Your startup workspace
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your company's WeFlow home
        </p>
      </div>

      {/* Logo upload */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex flex-col items-center justify-center gap-1 group"
          data-ocid="logo-upload-btn"
          aria-label="Upload workspace logo"
        >
          {data.logoPreview ? (
            <img
              src={data.logoPreview}
              alt="Logo preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <>
              <Plus className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-primary/60 group-hover:text-primary font-medium">
                Add logo
              </span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </button>
      </div>

      <FieldGroup label="Your Role" htmlFor="workspace-role">
        <div className="w-full h-9 rounded-md border border-input bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground cursor-not-allowed">
          Creator (Default)
        </div>
      </FieldGroup>


      <FieldGroup
        label="Startup Name"
        htmlFor="startup-name"
        error={errors.startupName}
      >
        <Input
          id="startup-name"
          value={data.startupName}
          onChange={(e) => onChange({ startupName: e.target.value })}
          placeholder="e.g. Acme Inc., Velocity Labs"
          autoFocus
          data-ocid="startup-name-input"
        />
      </FieldGroup>

      <FieldGroup label="Tagline" htmlFor="tagline" error={errors.tagline}>
        <Input
          id="tagline"
          value={data.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
          placeholder="e.g. Building the future of work"
          data-ocid="tagline-input"
        />
      </FieldGroup>
    </div>
  );
}

// ─── Step 4: Team ─────────────────────────────────────────────────────────────

function Step4({
  invites,
  onAddInvite,
  onRemoveInvite,
}: {
  invites: TeamInvite[];
  onAddInvite: (invite: TeamInvite) => void;
  onRemoveInvite: (index: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState("co-creator");

  function handleAdd() {
    if (!email.includes("@")) return;
    onAddInvite({ email, name, role, access: "Full", jobTitle });
    setEmail("");
    setName("");
    setJobTitle("");
  }

  return (
    <div className="w-full px-2 pt-2 pb-6">
      <div className="flex flex-col gap-4">
        <span className="text-sm font-black text-orange-600/80 uppercase tracking-[0.15em] ml-2">Add Team Member</span>
        <div className="flex items-center gap-5">
          <div className="flex-1 relative group">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex-1 relative group">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex-1 relative group">
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Role (e.g. Designer)"
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>
          <div className="w-[240px] relative group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="co-creator">co-creator</option>
              <option value="creator">creator</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!email}
            className="h-14 px-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 whitespace-nowrap"
          >
            Send invite
          </button>
        </div>
      </div>

      <div className="mt-8 mb-4 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent w-full" />

      <div className="px-6 mb-3 flex items-center gap-6">
         <div className="w-[200px] pl-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Name</div>
         <div className="w-[240px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Title</div>
         <div className="w-[140px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</div>
         <div className="flex-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address</div>
         <div className="w-[120px] text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</div>
         <div className="w-[200px]"></div> {/* spacer for buttons */}
      </div>

      <div className="space-y-3 px-2">
        {invites.map((invite, i) => (
          <div
            key={i}
            className="flex items-center gap-6 py-5 px-6 rounded-[1.5rem] bg-white hover:bg-orange-50/40 shadow-sm hover:shadow-md transition-all group/row border border-gray-100 hover:border-orange-200"
          >
            <div className="flex items-center gap-4 w-[200px] flex-shrink-0">
              <span className="text-[15px] font-black text-gray-300 w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[15px] font-bold text-gray-900 truncate group-hover/row:text-orange-600 transition-colors">{invite.name || "Member"}</span>
            </div>
            
            <div className="w-[240px] flex-shrink-0">
              <span className="text-[14px] font-semibold text-gray-600 italic truncate block">{invite.jobTitle || "ui/ux-graphic designer"}</span>
            </div>

            <div className="w-[140px] flex-shrink-0">
              <span className="text-[14px] font-bold text-gray-700 capitalize">{invite.role}</span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-medium text-gray-500 truncate block">{invite.email}</span>
            </div>

            <div className="w-[120px] flex-shrink-0 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[13px] font-bold uppercase tracking-wider text-orange-500">pending</span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="h-10 px-6 bg-white border border-orange-200 text-orange-600 rounded-xl font-bold text-[13px] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm">
                Edit
              </button>
              <button
                onClick={() => onRemoveInvite(i)}
                className="h-10 px-6 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-[13px] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {invites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No members added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}




// ─── Main Onboarding page ─────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "";

// ─── Step 5: Milestone ────────────────────────────────────────────────────────

function Step5({
  data,
  onChange,
  errors,
}: {
  data: MilestoneData;
  onChange: (d: Partial<MilestoneData>) => void;
  errors: Partial<MilestoneData>;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center text-center mb-6">
        <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-3">
          Final Step
        </span>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Define Your First Milestone
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-3 max-w-sm">
          What is the primary objective for your startup this month?
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <label htmlFor="milestone-name" className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
            Milestone Name <span className="text-orange-500">*</span>
          </label>
          <input
            id="milestone-name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Beta Launch"
            className={cn(
              "w-full h-14 rounded-2xl border bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm",
              errors.name 
                ? "border-red-300 focus:ring-red-500/20 focus:border-red-500/50" 
                : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500/50"
            )}
            required
          />
          {errors.name && (
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest ml-2">
              {errors.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="milestone-desc" className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
            Description
          </label>
          <textarea
            id="milestone-desc"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="What does success look like for this milestone?"
            className="w-full min-h-[140px] rounded-2xl border border-gray-200 bg-gray-50/50 p-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm resize-y"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="milestone-deadline" className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
            Deadline
          </label>
          <input
            id="milestone-deadline"
            type="date"
            value={data.endDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const createWorkspace = useCreateWorkspace();


  
  const [step, setStep] = useState(1);

  const [isSignIn, setIsSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [accountData, setAccountData] = useState<AccountData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [accountErrors, setAccountErrors] = useState<Partial<AccountData>>({});

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    title: "",
    bio: "",
    jobRole: "",
    avatarPreview: null,
  });

  const [profileErrors, setProfileErrors] = useState<Partial<ProfileData>>({});

  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    workspaceRole: "Creator",
    startupName: "",
    tagline: "",
    logoPreview: null,
  });
  const [workspaceErrors, setWorkspaceErrors] = useState<
    Partial<WorkspaceData>
  >({});

  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);

  function validateStep(): boolean {
    if (step === 1) {
      const errs: Partial<AccountData> = {};
      if (!isSignIn && !accountData.fullName.trim()) errs.fullName = "Name is required";
      if (!accountData.email.includes("@")) errs.email = "Enter a valid email";
      if (accountData.password.length < 8) errs.password = "Min. 8 characters";
      setAccountErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 2) {
      // Only logo is editable, but we might want to ensure they see it
      return true;
    }

    if (step === 3) {
      const errs: Partial<WorkspaceData> = {};
      if (!workspaceData.startupName.trim())
        errs.startupName = "Startup name is required";
      setWorkspaceErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 4) {
      if (teamInvites.length === 0) {
        alert("Please add at least 1 team member");
        return false;
      }
    }
    return true;
  }


  async function handleContinue() {
    if (!validateStep()) return;
    
    if (step === 1) {
      setIsLoading(true);
      try {
        if (isSignIn) {
          const { data } = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: accountData.email,
            password: accountData.password,
          });
          login(data, data.token);
          // If user already has a workspace (via invite), go to profile first
          if (data.workspaceId) {
            navigate({ to: "/profile" });
          } else {
            navigate({ to: "/dashboard" });
          }
        } else {
          const { data } = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: accountData.fullName,
            email: accountData.email,
            password: accountData.password,
          });
          login(data, data.token);
          // If invited user (already has workspaceId), go to profile setup then dashboard
          if (data.workspaceId) {
            navigate({ to: "/profile" });
          } else {
            setProfileData((p) => ({
              ...p,
              fullName: p.fullName || accountData.fullName,
            }));
            setStep(2);
          }
        }
      } catch (error: any) {
        console.error("Auth error", error);
        setAccountErrors({
          email: error.response?.data?.message || "Authentication failed",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 2) {
      setIsLoading(true);
      try {
        // Save profile logo
        if (profileData.avatarPreview) {
          await axios.put(`${BASE_URL}/api/auth/profile`, {
            profile_logo: profileData.avatarPreview,
          }, {
            headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
          });
        }
        setStep(3);
      } catch (err) {
        console.error("Profile update failed", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (step === 3) {
      setIsLoading(true);
      try {
        await createWorkspace.mutateAsync({
          name: workspaceData.startupName,
          tagline: workspaceData.tagline,
          role: "Creator", // Enforce Creator
        });
        setStep(4);
      } catch (err) {
        console.error("Workspace creation failed", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 4) {
      setIsLoading(true);
      try {
        // Re-fetch user profile to ensure workspaceId is up-to-date after Step 3
        const userRes = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
        });
        login(userRes.data, useAuthStore.getState().token!);

        // Send invitations one by one (don't abort all if one fails)
        for (const invite of teamInvites) {
          try {
            await axios.post(`${BASE_URL}/api/data/team/invite`, {
              email: invite.email,
              name: invite.name,
              role: invite.role,
            }, {
              headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
            });
          } catch (inviteErr: any) {
            console.warn(`Invite to ${invite.email} failed:`, inviteErr?.response?.data?.message || inviteErr.message);
          }
        }
        // Redirect straight to board after team setup
        navigate({ to: "/dashboard" });
      } catch (err) {
        console.error("Team invitation failed", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }


    
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }


  }

  async function handleGoogleSuccess(credentialResponse: any) {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${BASE_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      login(data, data.token);
      
      if (data.workspaceId) {
        // Invited user - go to profile then dashboard
        navigate({ to: "/profile" });
      } else if (data.isNewUser) {
        setProfileData((p) => ({ ...p, fullName: p.fullName || data.name }));
        setStep(2);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      setAccountErrors({ email: "Google authentication failed" });
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    setAccountErrors({ email: "Google login failed" });
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3.5 flex items-center">
        <WeFlowLogo size="sm" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className={cn(
          "w-full transition-all duration-500",
          step === 4 ? "max-w-6xl" : "max-w-xl"
        )}>

          {/* Logo centered above card — only step 1 */}
          {step === 1 && (
            <div className="flex flex-col items-center mb-8">
              <WeFlowLogo size="lg" centered />
            </div>
          )}

          {/* Progress dots */}
          <OnboardingProgress currentStep={step} />

          {/* Card */}
          <div className={cn(
            "bg-card rounded-2xl border border-border p-8 shadow-elevated transition-all duration-500",
            step === 4 && "p-0 border-none shadow-none bg-transparent"
          )}>

            {step === 1 && (
              <Step1
                data={accountData}
                onChange={(d) => setAccountData((p) => ({ ...p, ...d }))}
                errors={accountErrors}
                isSignIn={isSignIn}
                onGoogleSuccess={handleGoogleSuccess}
                onGoogleError={handleGoogleError}
              />
            )}
            {step === 2 && (
              <Step2
                data={profileData}
                onChange={(d) => setProfileData((p) => ({ ...p, ...d }))}
                errors={profileErrors}
              />
            )}
            {step === 3 && (
              <Step3
                data={workspaceData}
                onChange={(d) => setWorkspaceData((p) => ({ ...p, ...d }))}
                errors={workspaceErrors}
              />
            )}
            {step === 4 && (
              <Step4
                invites={teamInvites}
                onAddInvite={(invite) => setTeamInvites((prev) => [...prev, invite])}
                onRemoveInvite={(idx) =>
                  setTeamInvites((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            )}





            {/* Navigation */}
            <div
              className={cn(
                "flex items-center mt-8 pt-6 border-t border-border",
                step === 1 ? "justify-center" : (step === 4 ? "justify-center gap-6 pb-4" : "justify-between"),
              )}
            >
              {step > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    step === 4 && "h-14 px-10 border-2 border-gray-200 text-gray-500 rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center gap-3 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/50 hover:shadow-sm transition-all"
                  )}
                  data-ocid="onboarding-back-btn"
                >
                  ← Back
                </Button>
              )}
              <div className={cn("flex items-center gap-3", step === 4 && "gap-6")}>
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading}
                  className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground px-6 gap-1.5",
                    step === 4 && "h-14 px-12 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                  )}
                  data-ocid="onboarding-continue-btn"
                >

                  {isLoading ? "Loading..." : step === 3
                    ? "Create Workspace →"
                    : step === 4 ? "Send Invites & Continue →"
                    : isSignIn ? "Sign In →" : "Continue →"}

                </Button>
              </div>
            </div>
          </div>

          {/* Bottom link — only on step 1 */}
          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-5">
              {isSignIn ? "Don't have an account? " : "Have an account? "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => setIsSignIn(!isSignIn)}
                data-ocid="signin-link"
              >
                {isSignIn ? "Create one" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
