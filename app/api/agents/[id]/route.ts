import { executeSql } from "@/lib/aws/dsql";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return Response.json({ error: "Agent ID required", code: 400 }, { status: 400 });

  try {
    const result = await executeSql(
      "DELETE FROM agents WHERE id = $1 RETURNING id",
      [id]
    );

    if ("error" in result)
      return Response.json({ error: result.error, code: result.code }, { status: result.code });

    if (result.records.length === 0)
      return Response.json({ error: "Agent not found", code: 404 }, { status: 404 });

    return Response.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete agent";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
