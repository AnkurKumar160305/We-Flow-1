import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = ["Account", "Profile", "Workspace", "Team"];

export function OnboardingProgress({
  currentStep,
  totalSteps = 4,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground border border-border",
                )}
                data-ocid={`step-indicator-${step}`}
              >
                {isCompleted ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive
                    ? "text-primary"
                    : isCompleted
                      ? "text-primary/70"
                      : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "w-10 h-0.5 mb-4 transition-all duration-300",
                  step < currentStep ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
