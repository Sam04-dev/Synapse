import { seedRealData } from "@/lib/seed-real-data";

export async function POST() {
  try {
    const result = await seedRealData();
    if ("error" in result)
      return Response.json({ error: result.error }, { status: 500 });
    return Response.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Seeding failed";
    return Response.json({ error: msg, code: 500 }, { status: 500 });
  }
}
