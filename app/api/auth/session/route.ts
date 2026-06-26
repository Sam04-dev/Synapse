import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return Response.json({ user: null });
  const session = verifySession(token);
  if (!session) return Response.json({ user: null });
  return Response.json({ user: { id: session.id, email: session.email, name: session.name } });
}
