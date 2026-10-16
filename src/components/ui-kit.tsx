import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "text";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(({ variant = "primary", loading, className, children, disabled, ...rest }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed",
      variant === "primary" &&
        "w-full border border-primary bg-primary px-4 text-primary-foreground hover:bg-primary-hover disabled:opacity-80",
      variant === "text" && "px-2 text-primary hover:text-primary-hover",
      className,
    )}
    {...rest}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
    {children}
  </button>
));
Button.displayName = "Button";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-border bg-card", className)}>{children}</div>;
}

export function Tag({ tone, children }: { tone: "success" | "info" | "warning"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-sm px-1.5 text-[11px] font-medium",
        tone === "success" && "bg-success-tint text-success",
        tone === "info" && "bg-primary-tint text-primary",
        tone === "warning" && "bg-warning-tint text-warning",
      )}
    >
      {children}
    </span>
  );
}
