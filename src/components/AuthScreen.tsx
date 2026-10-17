import { useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button, Card } from "./ui-kit";
import { useSession } from "@/lib/session";
import { isEmail, validateCredentials, type AuthMode, type CredentialErrors } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0" aria-hidden focusable="false">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.917 35.273 27.172 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.222 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.946 35.525 44 30.161 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, sendPasswordReset } = useSession();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<CredentialErrors>({});
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recheck = (n = name, em = email, p = password) => touched && setErrors(validateCredentials(mode, n, em, p));

  async function onGoogle() {
    setFormError(null);
    setNotice(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Google sign-in didn't work. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setFormError(null);
    setNotice(null);
    const errs = validateCredentials(mode, name, email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUp(name.trim(), email.trim(), password);
        if (needsConfirmation) {
          setNotice(`We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`);
          setPassword("");
        }
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    setFormError(null);
    const trimmed = email.trim();
    if (!isEmail(trimmed)) {
      setTouched(true);
      setErrors((prev) => ({ ...prev, email: "Enter your email address first." }));
      return;
    }
    try {
      await sendPasswordReset(trimmed);
      setNotice("If an account exists for that email, a reset link is on its way.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't send the reset link. Please try again.");
    }
  }

  const tabs: { id: AuthMode; label: string }[] = [
    { id: "signin", label: "Sign in" },
    { id: "signup", label: "Create account" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mx-auto w-full max-w-[420px] p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Welcome to RideCompare</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compare Uber, Ola and Rapido fares in one place.</p>

        <Button
          type="button"
          onClick={onGoogle}
          loading={googleLoading}
          className="mt-6 border-border-strong bg-card text-foreground hover:bg-muted"
        >
          {!googleLoading && <GoogleMark />}
          {googleLoading ? "Please wait" : "Continue with Google"}
        </Button>

        <div className="mt-5 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-faint">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div role="tablist" aria-label="Authentication" className="mt-5 flex gap-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={mode === t.id}
              onClick={() => {
                setMode(t.id);
                setErrors({});
                setTouched(false);
                setNotice(null);
                setFormError(null);
              }}
              className={cn(
                "focus-ring relative -mb-px pb-3 text-sm font-medium transition-colors",
                mode === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {mode === t.id && (
                <motion.span layoutId="auth-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {mode === "signup" && (
            <Field label="Full name" error={errors.name}>
              {(id, describedBy) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.name}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    recheck(e.target.value);
                  }}
                  className={inputCls(!!errors.name)}
                />
              )}
            </Field>
          )}
          <Field label="Email" error={errors.email}>
            {(id, describedBy) => (
              <input
                id={id}
                type="email"
                aria-describedby={describedBy}
                aria-invalid={!!errors.email}
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  recheck(name, e.target.value);
                }}
                className={inputCls(!!errors.email)}
              />
            )}
          </Field>
          <Field
            label="Password"
            error={errors.password}
            aside={
              mode === "signin" ? (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="focus-ring rounded-sm text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Forgot password?
                </button>
              ) : null
            }
          >
            {(id, describedBy) => (
              <div className="relative">
                <input
                  id={id}
                  type={show ? "text" : "password"}
                  aria-describedby={describedBy}
                  aria-invalid={!!errors.password}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    recheck(name, email, e.target.value);
                  }}
                  className={cn(inputCls(!!errors.password), "pr-16")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            )}
          </Field>

          {formError && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
              {notice}
            </p>
          )}

          <Button type="submit" loading={loading} className="mt-2">
            {loading ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>

          {mode === "signup" && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              By creating an account you agree to the Terms of Service and Privacy Policy.
            </p>
          )}
        </form>
      </Card>
    </motion.div>
  );
}

function inputCls(invalid: boolean) {
  return cn(
    "focus-ring h-11 w-full rounded-md border bg-card px-3 text-sm text-foreground placeholder:text-faint transition-colors",
    invalid ? "border-destructive" : "border-border-strong",
  );
}

function Field({
  label,
  error,
  aside,
  children,
}: {
  label: string;
  error?: string | undefined;
  aside?: React.ReactNode | undefined;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {aside}
      </div>
      {children(id, error ? errId : undefined)}
      {error && (
        <p id={errId} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
