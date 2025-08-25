import { type NextRequest, NextResponse } from "next/server"
import { TidalService } from "@/lib/tidal-service"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const tidalService = new TidalService(token)
    const data = await tidalService.createPlaylist(title, description)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to create playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to create playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
