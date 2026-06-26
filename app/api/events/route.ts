import { NextResponse } from "next/server";
import { logEvent, queryEvents } from "@/lib/aws/dynamodb";
import type { AgentEvent } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  const result = await queryEvents(agentId);

  if ("error" in result) {
    return NextResponse.json(result, { status: result.code });
  }

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let body: AgentEvent;

  try {
    body = (await request.json()) as AgentEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: 400 },
      { status: 400 }
    );
  }

  if (!body.PK || !body.SK || !body.action) {
    return NextResponse.json(
      { error: "PK, SK, and action are required", code: 400 },
      { status: 400 }
    );
  }

  const result = await logEvent(body);

  if ("error" in result) {
    return NextResponse.json(result, { status: result.code });
  }

  return NextResponse.json({ success: true });
}
