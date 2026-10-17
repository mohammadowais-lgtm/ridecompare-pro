export type AuthMode = "signin" | "signup";

export interface CredentialErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateCredentials(mode: AuthMode, name: string, email: string, password: string): CredentialErrors {
  const errors: CredentialErrors = {};
  if (mode === "signup" && name.trim().length < MIN_NAME_LENGTH) errors.name = "Enter at least 2 characters.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = "Use at least 8 characters.";
  return errors;
}
