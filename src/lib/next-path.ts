/** Only these app pages may be resumed after a sign-in round-trip. */
export const RESUMABLE_PATHS = ["/location", "/compare"] as const;
export type ResumablePath = (typeof RESUMABLE_PATHS)[number];

const NEXT_KEY = "rideco