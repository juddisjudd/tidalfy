import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    const allPlaylists: any[] = []
    let nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50"
    let requestCount = 0
    const maxRequests = 10 // Prevent infinite loops, max 500 playlists

    while (nextUrl && requestCount < maxRequests) {
      console.log(`Fetching playlists batch ${requestCount + 1}...`)

      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Spotify API error:", errorText)

        // If it's a token expiration error, return a specific error
        if (response.status === 401) {
          return NextResponse.json(
            {
              error: "Token expired",
              details: "Your Spotify session has expired. Please reconnect your account.",
              code: "TOKEN_EXPIRED",
            },
            { status: 401 },
          )
        }

        // If it's a 403 error (development app user limit)
        if (response.status === 403) {
          return NextResponse.json(
            {
              error: "Access restricted",
              details:
                "This app is in development mode and only allows specific users. Contact the developer to be added to the allowlist.",
              code: "DEVELOPMENT_MODE_RESTRICTION",
              suggestion:
                "The app owner needs to add your Spotify account to the user allowlist in the Spotify Developer Dashboard.",
            },
            { status: 403 },
          )
        }

        // If it's a rate limit error, wait and retry once
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after")
          const waitTime = retryAfter ? Number.parseInt(retryAfter) * 1000 : 1000
          console.log(`Rate limited, waiting ${waitTime}ms...`)

          await new Promise((resolve) => setTimeout(resolve, waitTime))

          // Retry the same request
          const retryResponse = await fetch(nextUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!retryResponse.ok) {
            throw new Error(`Failed to fetch playlists after retry: ${retryResponse.status}`)
          }

          const retryData = await retryResponse.json()
          allPlaylists.push(...(retryData.items || []))
          nextUrl = retryData.next
        } else {
          throw new Error(`Failed to fetch playlists: ${response.status} - ${errorText}`)
        }
      } else {
        const data = await response.json()
        allPlaylists.push(...(data.items || []))
        nextUrl = data.next
      }

      requestCount++

      // Add a small delay between requests to be nice to Spotify's API
      if (nextUrl) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    console.log(`Successfully fetched ${allPlaylists.length} playlists in ${requestCount} requests`)

    return NextResponse.json({
      items: allPlaylists,
      total: allPlaylists.length,
    })
  } catch (error) {
    console.error("Failed to fetch playlists:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch playlists",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Please try refreshing the page or reconnecting your Spotify account",
      },
      { status: 500 },
    )
  }
}
