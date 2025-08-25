import { type NextRequest, NextResponse } from "next/server"
import { TidalService } from "@/lib/tidal-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const playlistId = params.id

  try {
    const { trackIds } = await request.json()

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json({ error: "Track IDs are required" }, { status: 400 })
    }

    const tidalService = new TidalService(token)
    const data = await tidalService.addTracksToPlaylist(playlistId, trackIds)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to add tracks to playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to add tracks to playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
