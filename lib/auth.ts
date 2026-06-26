import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.JWT_SECRET ?? "synapse_dev_secret_change_in_prod";
const TTL_SECS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export function signSession(user: SessionUser): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECS;
  const payload = Buffer.from(JSON.stringify({ ...user, exp })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string): (SessionUser & { exp: number }) | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig, "ascii"), Buffer.from(expected, "ascii"))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp: number };
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "synapse_session";
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: TTL_SECS,
  path: "/",
};
