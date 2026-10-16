import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface User {
  name: string;
  email: string;
}

export interface Coords {
  lat: number;
  lng: number;
}

/** Auth service contract. Swap MockAuthService for a real backend later. */
export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Demo only: never stores or transmits passwords. */
export const MockAuthService: AuthService = {
  async signIn(email) {
    await wait(700);
    const local = email.split("@")[0] ?? "Rider";
    return { email, name: local.charAt(0).toUpperCase() + local.slice(1) };
  },
  async signUp(name, email) {
    await wait(800);
    return { name, email };
  },
  async signOut() {},
};

interface SessionValue {
  user: User | null;
  currentLocation: Coords | null;
  auth: AuthService;
  setUser: (u: User | null) => void;
  setCurrentLocation: (c: Coords | null) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children, auth = MockAuthService }: { children: ReactNode; auth?: AuthService }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);
  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setCurrentLocation(null);
  }, [auth]);
  const value = useMemo(
    () => ({ user, currentLocation, auth, setUser, setCurrentLocation, signOut }),
    [user, currentLocation, auth, signOut],
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
