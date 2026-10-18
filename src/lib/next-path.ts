/** Only these app pages may be resumed after a sign-in round-trip. */
export const RESUMABLE_PATHS = ["/location", "/compare"] as const;
export type ResumablePath = (typeof RESUMABLE_PATHS)[number];

const NEXT_KEY = "ridecompare-next";

/** Remember where the user wanted to go so a provider round-trip can resume it. */
export function rememberNext(path: ResumablePath) {
  try {
    sessionStorage.setItem(NEXT_KEY, path);
  } catch {
    // Storage can be unavailable; the app then opens its default page.
  }
}

/** Read and clear the stored destination. Anything outside the app's own pages is ignored. */
export function takeNext(): ResumablePath | null {
  let stored: string | null = null;
  try {
    stored = sessionStorage.getItem(NEXT_KEY);
    if (stored !== null) sessionStorage.removeItem(NEXT_KEY);
  } catch {
    return null;
  }
  return (RESUMABLE_PATHS as readonly string[]).includes(stored ?? "") ? (stored as ResumablePath) : null;
}
