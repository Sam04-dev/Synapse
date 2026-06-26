import { runMigrations } from "@/lib/aws/dsql-schema";

export async function POST() {
  try {
    const result = await runMigrations();
    if ("error" in result)
      return Response.json(result, { status: 500 });
    return Response.json({ message: "Schema migration completed" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
