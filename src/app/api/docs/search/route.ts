import { NextResponse } from "next/server";
import { searchDocs } from "@/mcp/docs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "6");
  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }
  return NextResponse.json({ results: searchDocs(query, Number.isFinite(limit) ? limit : 6) });
}
