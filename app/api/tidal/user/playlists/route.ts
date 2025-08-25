import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    console.log("Fetching user's Tidal playlists...")

    const response = await fetch("https://openapi.tidal.com/v2/my/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
    })

    const responseText = await response.text()
    console.log("Tidal user playlists response:", {
      status: response.status,
      body: responseText.substring(0, 500) + "...",
    })

    if (!response.ok) {
      console.error("Tidal user playlists error:", responseText)
      return NextResponse.json({ error: "Failed to fetch user playlists" }, { status: response.status })
    }

    return NextResponse.json(JSON.parse(responseText))
  } catch (error) {
    console.error("Failed to fetch user playlists:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user playlists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
