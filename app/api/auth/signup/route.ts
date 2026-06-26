import { hash } from "bcryptjs";
import { executeSql } from "@/lib/aws/dsql";
import { runMigrations } from "@/lib/aws/dsql-schema";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deriveName(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") || "User";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid email required", code: 400 }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters", code: 400 }, { status: 400 });
    }

    await runMigrations();

    const existing = await executeSql("SELECT id FROM users WHERE email = $1", [email]);
    if (!("error" in existing) && existing.records.length > 0) {
      return Response.json({ error: "Email already registered", code: 409 }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const result = await executeSql(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );

    if ("error" in result) {
      return Response.json({ error: result.error, code: 500 }, { status: 500 });
    }

    const row = result.records[0];
    return Response.json(
      { id: row.id as string, email: row.email as string, name: deriveName(email) },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
