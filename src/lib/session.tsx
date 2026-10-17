import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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

/** Only these app pages may be resumed after a sign-in round-trip. */
export const RESUMABLE_PATHS = ["/location", "/compare"] as const;
export type ResumablePath = (typeof RESUMABLE_PATHS)[number];

const NEXT_KEY = "rideco