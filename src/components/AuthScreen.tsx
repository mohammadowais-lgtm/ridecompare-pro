import { useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button, Card } from "./ui-kit";
import { useSession, type User } from "@/lib/session";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";
type Errors = Partial<Record<"name" | "email" | "password", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(mode: Mode, name: string, email: string, password: string): Errors {
  const e: Errors = {};
  if (mode === "signup" && name.trim().length < 2) e.name = "Enter at least 2 characters.";
  if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
  if (password.length < 8) e.password = "Use at least 8 characters.";
  return e;
}

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (u: User) => void }) {
  const { auth } = useSession();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const recheck = (n = name, em = email, p = password) => touched && setErrors(validate(mode, n, em, p));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const errs = validate(mode, name, email, password);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const user =
        mode === "signin" ? await auth.signIn(email.trim(), password) : await auth.signUp(name.trim(), email.trim(), password);
      setPassword("");
      onAuthenticated(user);
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: "signin", label: "Sign in" },
    { id: "signup", label: "Create account" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mx-auto w-full max-w-[420px] p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Welcome to RideCompare</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compare Uber, Ola and Rapido fares in one place.</p>

        <div role="tablist" aria-label="Authentication" className="mt-6 flex gap-6 border-b border-border">
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
                <a href="#" onClick={(e) => e.preventDefault()} className="focus-ring rounded-sm text-xs font-medium text-primary hover:text-primary-hover">
                  Forgot password?
                </a>
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

          <Button type="submit" loading={loading} className="mt-2">
            {loading ? "Please wait" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>

          {mode === "signup" && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              By creating an account you agree to the Terms of Service and Privacy Policy.
            </p>
          )}
        </form>

        <p className="mt-6 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          Demo: no account is created.
        </p>
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
  error?: string;
  aside?: React.ReactNode;
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
