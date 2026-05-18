import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { WeFlowLogo } from "../components/WeFlowLogo";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const { token } = useParams({ from: '/accept-invite/$token' });

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    async function verifyToken() {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/data/accept-invite/${token}`);
        setStatus('success');
        setWorkspaceName(data.workspaceName || 'your team');
        setMessage(data.message || "Invitation accepted successfully!");
      } catch (err: any) {
        console.error("Invite error", err);
        setStatus('error');
        setMessage(err.response?.data?.message || "Invalid or expired invitation.");
      }
    }
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-elevated text-center space-y-6">
        <div className="flex justify-center mb-2">
          <WeFlowLogo size="lg" centered />
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Verifying your invitation...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome to the Team!</h2>
            <p className="text-muted-foreground">
              You've been added to <strong>{workspaceName}</strong>. Sign in or create an account to get started.
            </p>
            <div className="w-full space-y-3 mt-2">
              <Button
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                onClick={() => navigate({ to: "/onboarding" })}
              >
                <ArrowRight className="w-4 h-4" />
                Sign In / Create Account →
              </Button>
              <p className="text-xs text-muted-foreground">
                After signing in, you'll complete your profile and be taken to the dashboard.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Invitation Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate({ to: "/onboarding" })}
            >
              Go to Homepage
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-8 opacity-50">
        © 2024 WeFlow by nHive. All rights reserved.
      </p>
    </div>
  );
}
