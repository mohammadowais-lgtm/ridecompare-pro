import { beforeEach, describe, expect, it } from "vitest";
import { isEmail, validateCredentials } from "@/lib/auth-validation";
import { rememberNext, takeNext } from "@/lib/next-path";

describe("Sign-in rules", () => {
  it("rejects a password shorter than 8 characters", () => {
    expect(validateCredentials("signin", "", "rider@example.com", "1234567")).toEqual({
      password: "Use at least 8 characters.",
    });
  });

  it("rejects an address with no domain", () => {
    expect(validateCredentials("signin", "", "rider", "longenough")).toEqual({
      email: "Enter a valid email address.",
    });
  });

  it("requires a real name when creating an account but not when signing in", () => {
    expect(validateCredentials("signup", "O", "rider@example.com", "longenough").name).toBe("Enter at least 2 characters.");
    expect(validateCredentials("signin", "", "rider@example.com", "longenough")).toEqual({});
  });

  it("accepts a well-formed account", () => {
    expect(validateCredentials("signup", "Owais", "owais@example.com", "password1")).toEqual({});
    expect(isEmail("owais@example.com")).toBe(true);
  });
});

describe("Where sign-in sends you", () => {
  beforeEach(() => sessionStorage.clear());

  it("resumes the page the user was heading to, once", () => {
    rememberNext("/location");
    expect(takeNext()).toBe("/location");
    expect(takeNext()).toBeNull();
  });

  it("ignores a stored address that isn't one of the app's pages", () => {
    sessionStorage.setItem("ridecompare-next", "https://example.com/steal");
    expect(takeNext()).toBeNull();
  });
});
