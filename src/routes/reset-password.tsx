import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

// Read before Supabase's client consumes the recovery tokens from the URL hash.
const INITIAL_HASH = typeof window === "undefined" ? "" : window.location.hash;

type Stage = "checking" | "recovery" | "signedin" | "invalid";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password · RideCompare" },
      { name: "description", content: "Set a new password for your RideCompare account." },
      { property: "og:title", content: "Choose a new password · RideCompare" },
      { property: "og:description", content: "Set a new password for your RideCompare account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(INITIAL_HASH.replace(/^#/, ""));
    const isRecovery = params.get("type") === "recovery";
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setStage("invalid");
        return;
      }
      setStage(isRecovery ? "recovery" : "signedin");
    });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      // A recovery session is exempt from the current-password check; a signed-in
      // change must prove the old password.
      const payload = stage === "recovery" ? { password } : { password, current_password: current };
      const { error: updateError } = await supabase.auth.updateUser(payload);
      if (updateError) throw new Error(updateError.message || "We couldn't update your password. Please try again.");
      navigate({ to: "/compare" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't update your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mx-auto w-full max-w-[420px] p-6 sm:p-8">
        {stage === "invalid" ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">This link isn't valid</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Password reset links expire and can only be used once. Request a new one from the sign-in screen.
            </p>
            <Link
              to="/"
              className="focus-ring mt-6 inline-flex h-11 w-full items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Back to sign in
            </Link>
          </>
        ) : stage === "checking" ? (
          <p className="text-sm text-muted-foreground" role="status">
            Checking your reset link…
          </p>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stage === "recovery" ? "Your reset link is valid." : "You're signed in — confirm your current password."}
            </p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              {stage === "signedin" && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    className={inputCls}
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Confirm new password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputCls}
                />
              </label>

              {error && (
                <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" loading={saving} className="mt-2">
                {saving ? "Please wait" : "Save new password"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </motion.div>
  );
}

const inputCls = cn(
  "focus-ring h-11 w-full rounded-md border border-border-strong bg-card px-3 text-sm text-foreground placeholder:text-faint transition-colors",
);
