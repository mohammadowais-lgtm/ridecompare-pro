import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { rememberNext } from "@/lib/next-path";
export { RESUMABLE_PATHS, rememberNext, takeNext } from "@/lib/next-path";
export type { ResumablePath } from "@/lib/next-path";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Coords {
  lat: number;
  lng: number;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readUser(session: Session | null): Promise<User | null> {
  const authUser = session?.user;
  if (!authUser) return null;

  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const { data } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", authUser.id).maybeSingle();

  const email = authUser.email ?? "";
  return {
    id: authUser.id,
    email,
    name:
      text(data?.full_name) ??
      text(meta["full_name"]) ??
      text(meta["name"]) ??
      text(meta["user_name"]) ??
      text(email.split("@")[0]) ??
      "Rider",
    avatarUrl: text(data?.avatar_url) ?? text(meta["avatar_url"]) ?? text(meta["picture"]),
  };
}

/** Turns backend auth messages into wording a rider can act on. */
function authMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) return "Confirm your email first — open the link we sent you.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("user already registered")) return "An account with this email already exists. Sign in instead.";
  return message || "Something went wrong. Please try again.";
}

interface SessionValue {
  user: User | null;
  ready: boolean;
  currentLocation: Coords | null;
  setCurrentLocation: (c: Coords | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(async ({ data }) => {
      const next = await readUser(data.session);
      if (!active) return;
      setUser(next);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION and TOKEN_REFRESHED only restate state we already hold.
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        setCurrentLocation(null);
        setReady(true);
        return;
      }
      void readUser(session).then((next) => {
        if (active) setUser(next);
      });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(authMessage(error.message));
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
    });
    if (error) throw new Error(authMessage(error.message));
    return { needsConfirmation: data.session === null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    rememberNext("/location");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) throw new Error(authMessage(result.error.message ?? "Google sign-in didn't work."));
    // When the browser is sent to Google, the session arrives on the next page
    // load and the sign-in screen resumes the stored route.
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(authMessage(error.message));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentLocation(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      currentLocation,
      setCurrentLocation,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
    }),
    [user, ready, currentLocation, signIn, signUp, signInWithGoogle, sendPasswordReset, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function requestPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(e),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}
