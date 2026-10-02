import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "quarn_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return secret;
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = String(expiresAt);
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) return false;

  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra !== undefined) return false;

  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(expiresAt)
    .digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function passwordsMatch(password: string) {
  const configuredPasswords = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_PASSWORD_2,
  ].filter((value): value is string => Boolean(value));
  const actualBuffer = Buffer.from(password);

  let matches = false;
  for (const expected of configuredPasswords) {
    const expectedBuffer = Buffer.from(expected);
    const sameLength = actualBuffer.length === expectedBuffer.length;
    const matchesPassword =
      sameLength && timingSafeEqual(actualBuffer, expectedBuffer);
    matches = matches || matchesPassword;
  }

  return matches;
}
