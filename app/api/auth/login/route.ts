import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { executeSql } from "@/lib/aws/dsql";
import { signSession, SESSION_COOKIE, COOKIE_OPTS } from "@/lib/auth";

function deriveName(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "User";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return Response.json({ error: "Email and password required", code: 400 }, { status: 400 });
    }

    const result = await executeSql(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if ("error" in result || result.records.length === 0) {
      return Response.json({ error: "Invalid credentials", code: 401 }, { status: 401 });
    }

    const row = result.records[0];
    const valid = await compare(password, row.password_hash as string);
    if (!valid) {
      return Response.json({ error: "Invalid credentials", code: 401 }, { status: 401 });
    }

    const id = row.id as string;
    const userEmail = row.email as string;
    const name = deriveName(userEmail);
    const token = signSession({ id, email: userEmail, name });

    cookies().set(SESSION_COOKIE, token, COOKIE_OPTS);

    return Response.json({ id, email: userEmail, name });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
