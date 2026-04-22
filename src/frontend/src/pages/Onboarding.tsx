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
}: {
  data: AccountData;
  onChange: (d: Partial<AccountData>) => void;
  errors: Partial<AccountData>;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-display text-foreground">
          Create your account
        </h2>
      </div>

      {/* Google button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-sm font-medium text-foreground shadow-sm"
        data-ocid="google-signin-btn"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          role="img"
          aria-label="Google logo"
        >
          <path
            d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91A8.78 8.78 0 0 0 17.64 9.2z"
            fill="#4285F4"
          />
          <path
            d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.91-2.26A5.43 5.43 0 0 1 9 14.5a5.44 5.44 0 0 1-5.12-3.76H.89v2.33A9 9 0 0 0 9 18z"
            fill="#34A853"
          />
          <path
            d="M3.88 10.74A5.44 5.44 0 0 1 3.6 9a5.44 5.44 0 0 1 .28-1.74V4.93H.89A9 9 0 0 0 0 9a9 9 0 0 0 .89 4.07l2.99-2.33z"
            fill="#FBBC05"
          />
          <path
            d="M9 3.5a4.87 4.87 0 0 1 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0a9 9 0 0 0-8.11 4.93l2.99 2.33A5.44 5.44 0 0 1 9 3.5z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <OrDivider />

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

      <FieldGroup label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="alex@startup.com"
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

// ─── Step 4: Invite team ──────────────────────────────────────────────────────

const JOB_ROLES = [
  "Developer",
  "Designer",
  "Marketing",
  "Operations",
  "Manager",
];
const ACCESS_TYPES = ["Co-Creator", "Member", "Viewer"];

function Step4({
  invites,
  onAdd,
  onRemove,
}: {
  invites: TeamInvite[];
  onAdd: (invite: TeamInvite) => void;
  onRemove: (email: string) => void;
}) {
  const [form, setForm] = useState<TeamInvite>({
    email: "",
    name: "",
    role: "Developer",
    access: "Co-Creator",
  });
  const [emailError, setEmailError] = useState("");

  function handleAdd() {
    if (!form.email.includes("@")) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    onAdd({ ...form });
    setForm({ email: "", name: "", role: "Developer", access: "Co-Creator" });
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-display text-foreground">
          Invite your team
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add teammates to your workspace. You can skip this.
        </p>
      </div>

      {/* Email + Name row */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Email" htmlFor="invite-email" error={emailError}>
          <Input
            id="invite-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="teammate@company.com"
            data-ocid="invite-email-input"
          />
        </FieldGroup>
        <FieldGroup label="Name" htmlFor="invite-name">
          <Input
            id="invite-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Full name"
            data-ocid="invite-name-input"
          />
        </FieldGroup>
      </div>

      {/* Role + Access row */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Job Role" htmlFor="invite-role">
          <select
            id="invite-role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="invite-role-select"
          >
            {JOB_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Access Type" htmlFor="invite-access">
          <select
            id="invite-access"
            value={form.access}
            onChange={(e) => setForm((f) => ({ ...f, access: e.target.value }))}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-ocid="invite-access-select"
          >
            {ACCESS_TYPES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      {/* Get Invite Link button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2 border-primary/40 text-primary hover:bg-primary/5"
          onClick={handleAdd}
          data-ocid="add-invite-btn"
        >
          <Upload className="w-4 h-4" />
          Add to List
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          data-ocid="get-invite-link-btn"
        >
          <Link2 className="w-4 h-4" />
          Get Invite Link
        </Button>
      </div>

      {/* Invites list */}
      {invites.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {invites.map((inv) => (
            <div
              key={inv.email}
              className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(inv.name || inv.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {inv.name || inv.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {inv.role} · {inv.access}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(inv.email)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 ml-2"
                aria-label={`Remove ${inv.email}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Onboarding page ─────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

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
      if (!accountData.fullName.trim()) errs.fullName = "Name is required";
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

  function handleContinue() {
    if (!validateStep()) return;
    if (step === 1) {
      // Pre-fill profile name from account
      setProfileData((p) => ({
        ...p,
        fullName: p.fullName || accountData.fullName,
      }));
    }
    if (step === 3) {
      navigate({ to: "/milestones" });
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      navigate({ to: "/dashboard" });
    }
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
                onAdd={(inv) => setTeamInvites((t) => [...t, inv])}
                onRemove={(email) =>
                  setTeamInvites((t) => t.filter((i) => i.email !== email))
                }
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
                {step === 4 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="text-muted-foreground text-sm"
                    data-ocid="onboarding-skip-btn"
                  >
                    Skip for now
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleContinue}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 gap-1.5"
                  data-ocid="onboarding-continue-btn"
                >
                  {step === 4
                    ? "Launch Workspace →"
                    : step === 3
                      ? "Create Workspace →"
                      : "Continue →"}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom link — only on step 1 */}
          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground mt-5">
              Have an account?{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                data-ocid="signin-link"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
