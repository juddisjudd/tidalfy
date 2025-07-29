import { type NextRequest, NextResponse } from "next/server";
import { TidalService } from "@/lib/tidal-service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!authHeader) {
    return NextResponse.json(
      { error: "No authorization header" },
      { status: 401 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: "No search query provided" },
      { status: 400 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const tidalService = new TidalService(token);
    const { data, error } = await tidalService.searchTracks(query);

    if (error) {
      return NextResponse.json(
        { error: "Search failed", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Tidal search error:", error);
    return NextResponse.json(
      {
        error: "Failed to search tracks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
