import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Link2, Plus, Upload, X } from "lucide-react";
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
          Set up your profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell your team a bit about yourself
        </p>
      </div>

      {/* Avatar upload */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex flex-col items-center justify-center gap-1 group"
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
              <Camera className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-primary/60 group-hover:text-primary font-medium">
                Add photo
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

      <FieldGroup
        label="Full Name"
        htmlFor="profile-name"
        error={errors.fullName}
      >
        <Input
          id="profile-name"
          value={data.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Alex Johnson"
          data-ocid="profile-name-input"
        />
      </FieldGroup>

      <FieldGroup
        label="Your Title"
        htmlFor="profile-title"
        error={errors.title}
      >
        <Input
          id="profile-title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Co-Founder & CEO"
          data-ocid="profile-title-input"
        />
      </FieldGroup>

      <FieldGroup label="Bio (optional)" htmlFor="profile-bio">
        <Textarea
          id="profile-bio"
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Tell your team what you're working on..."
          className="resize-none h-20"
          data-ocid="profile-bio-input"
        />
      </FieldGroup>
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
        <select
          id="workspace-role"
          value={data.workspaceRole}
          onChange={(e) =>
            onChange({
              workspaceRole: e.target.value as "Creator" | "Co-creator",
            })
          }
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="workspace-role-select"
        >
          <option value="Creator">Creator</option>
          <option value="Co-creator">Co-creator</option>
        </select>
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

// Step 4 removed as per new flow

// ─── Main Onboarding page ─────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "";

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
      const errs: Partial<ProfileData> = {};
      if (!profileData.fullName.trim()) errs.fullName = "Name is required";
      if (!profileData.title.trim()) errs.title = "Title is required";
      setProfileErrors(errs);
      return Object.keys(errs).length === 0;
    }
    if (step === 3) {
      const errs: Partial<WorkspaceData> = {};
      if (!workspaceData.startupName.trim())
        errs.startupName = "Startup name is required";
      setWorkspaceErrors(errs);
      return Object.keys(errs).length === 0;
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
          navigate({ to: "/dashboard" });
        } else {
          const { data } = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: accountData.fullName,
            email: accountData.email,
            password: accountData.password,
          });
          login(data, data.token);
          setProfileData((p) => ({
            ...p,
            fullName: p.fullName || accountData.fullName,
          }));
          setStep(2);
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
    
    if (step === 3) {
      setIsLoading(true);
      try {
        await createWorkspace.mutateAsync({
          name: workspaceData.startupName,
          tagline: workspaceData.tagline,
          role: workspaceData.workspaceRole,
        });
        navigate({ to: "/milestones", search: { onboard: true } as any });
      } catch (err) {
        console.error("Workspace creation failed", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (step < 3) {
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
      
      if (data.isNewUser) {
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

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo centered above card — only step 1 */}
          {step === 1 && (
            <div className="flex flex-col items-center mb-8">
              <WeFlowLogo size="lg" centered />
            </div>
          )}

          {/* Progress dots */}
          <OnboardingProgress currentStep={step} />

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-elevated">
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


            {/* Navigation */}
            <div
              className={cn(
                "flex items-center mt-8 pt-6 border-t border-border",
                step === 1 ? "justify-center" : "justify-between",
              )}
            >
              {step > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="onboarding-back-btn"
                >
                  ← Back
                </Button>
              )}
              <div className="flex items-center gap-3">

                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 gap-1.5"
                  data-ocid="onboarding-continue-btn"
                >
                  {isLoading ? "Loading..." : step === 3
                    ? "Create Workspace →"
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
