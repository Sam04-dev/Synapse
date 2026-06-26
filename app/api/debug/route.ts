import { executeSql } from "@/lib/aws/dsql";

export async function GET() {
  try {
    const checks = await Promise.all([
      executeSql("SELECT 1 AS ok"),
      executeSql("SELECT COUNT(*)::int AS total FROM agents"),
      executeSql("SELECT COUNT(*)::int AS total FROM memories"),
      executeSql("SELECT COUNT(*)::int AS total FROM relationships"),
    ]);

    const dsqlOk = !("error" in checks[0]);
    const agents = !("error" in checks[1]) ? Number(checks[1].records[0]?.total ?? 0) : 0;
    const memories = !("error" in checks[2]) ? Number(checks[2].records[0]?.total ?? 0) : 0;
    const relationships = !("error" in checks[3]) ? Number(checks[3].records[0]?.total ?? 0) : 0;

    return Response.json({
      dsql: { connected: dsqlOk, error: "error" in checks[0] ? checks[0].error : null },
      dynamo: { connected: true },
      counts: { agents, memories, relationships },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Debug check failed";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
