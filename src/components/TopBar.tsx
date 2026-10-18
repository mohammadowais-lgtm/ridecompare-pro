import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Route as RouteIcon } from "lucide-react";
import { useSession } from "@/lib/session";

export function TopBar() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user?.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-card">
            <RouteIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">RideCompare</span>
        </div>
        {user && (
          <div className="relative" ref={ref}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Account menu"
              onClick={() => setOpen((o) => !o)}
              className="focus-ring grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-border bg-primary-tint text-xs font-semibold text-primary"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card p-1 shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--foreground)_25%,transparent)]"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    role="menuitem"
                    type="button"
                    onClick={async () => {
                      setOpen(false);
                      await signOut();
                      navigate({ to: "/" });
                    }}
                    className="focus-ring flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
