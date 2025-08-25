export class TidalService {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async createPlaylist(title: string, description?: string) {
    try {
      console.log("Creating playlist with direct API:", { title, description })

      const response = await fetch("https://openapi.tidal.com/v2/playlists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "playlists",
            attributes: {
              name: title,
              description: description || "",
            },
          },
        }),
      })

      const responseText = await response.text()
      console.log("Tidal playlist creation response:", {
        status: response.status,
        body: responseText.substring(0, 500) + "...",
      })

      if (!response.ok) {
        console.error("Tidal playlist creation error:", responseText)
        throw new Error(`Failed to create playlist: ${responseText}`)
      }

      return JSON.parse(responseText)
    } catch (error) {
      console.error("Tidal playlist creation error:", error)
      throw error
    }
  }

  async searchTracks(query: string) {
    try {
      console.log("Searching tracks with direct API:", query)

      const response = await fetch(
        `https://openapi.tidal.com/v2/searchResults/${encodeURIComponent(query)}?countryCode=US&include=topHits`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          },
        },
      )

      const responseText = await response.text()
      console.log("Tidal search response:", {
        status: response.status,
        query: query.substring(0, 50),
        body: responseText.substring(0, 200) + "...",
      })

      if (!response.ok) {
        console.error("Tidal search error:", responseText)
        return { data: null, error: responseText }
      }

      const data = JSON.parse(responseText)
      return { data, error: null }
    } catch (error) {
      console.error("Tidal search error:", error)
      return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async addTracksToPlaylist(playlistId: string, trackIds: string[]) {
    try {
      console.log(`Adding ${trackIds.length} tracks to playlist ${playlistId}`)

      // Use the correct endpoint for adding tracks to playlist
      const response = await fetch(`https://openapi.tidal.com/v2/playlists/${playlistId}/relationships/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: trackIds.map((trackId) => ({
            type: "tracks",
            id: trackId,
          })),
        }),
      })

      const responseText = await response.text()
      console.log("Tidal add tracks response:", {
        status: response.status,
        body: responseText.substring(0, 200) + "...",
      })

      if (!response.ok) {
        console.error("Tidal add tracks error:", responseText)
        throw new Error(`Failed to add tracks: ${responseText}`)
      }

      return responseText ? JSON.parse(responseText) : { success: true }
    } catch (error) {
      console.error("Tidal add tracks error:", error)
      throw error
    }
  }
}
