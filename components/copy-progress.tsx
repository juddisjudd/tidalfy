"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, CheckCircle, AlertCircle, Music, Zap } from "lucide-react"

interface CopyProgressProps {
  spotifyToken: string
  tidalToken: string
  playlist: any
  status: "idle" | "copying" | "completed" | "error"
  onStatusChange: (status: "idle" | "copying" | "completed" | "error") => void
  onBack: () => void
}

interface TrackStats {
  total: number
  processed: number
  found: number
  notFound: number
  skipped: number
  skippedReasons: string[]
}

export function CopyProgress({
  spotifyToken,
  tidalToken,
  playlist,
  status,
  onStatusChange,
  onBack,
}: CopyProgressProps) {
  const [progress, setProgress] = useState(0)
  const [currentTrack, setCurrentTrack] = useState("")
  const [trackStats, setTrackStats] = useState<TrackStats>({
    total: 0,
    processed: 0,
    found: 0,
    notFound: 0,
    skipped: 0,
    skippedReasons: [],
  })
  const [errorDetails, setErrorDetails] = useState<string[]>([])

  const handleCopyPlaylist = async () => {
    onStatusChange("copying")
    setProgress(0)
    setTrackStats({
      total: 0,
      processed: 0,
      found: 0,
      notFound: 0,
      skipped: 0,
      skippedReasons: [],
    })
    setErrorDetails([])

    try {
      console.log("Starting playlist rebuild process...")

      // Fetch playlist tracks from Spotify
      const tracksResponse = await fetch(`/api/spotify/playlist/${playlist.id}/tracks`, {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      })

      if (!tracksResponse.ok) {
        const errorText = await tracksResponse.text()
        console.error("Failed to fetch Spotify tracks:", errorText)
        throw new Error("Failed to fetch playlist tracks")
      }

      const tracksData = await tracksResponse.json()
      const tracks = tracksData.items || []

      console.log(`Found ${tracks.length} track entries to process`)

      if (tracks.length === 0) {
        throw new Error("No tracks found in playlist")
      }

      // Initialize stats
      setTrackStats((prev) => ({ ...prev, total: tracks.length }))

      // Create playlist on Tidal
      console.log("Creating Tidal playlist...")
      const createPlaylistResponse = await fetch("/api/tidal/playlists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tidalToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: playlist.name,
          description: playlist.description || `Rebuilt from Spotify - ${tracks.length} track entries`,
        }),
      })

      if (!createPlaylistResponse.ok) {
        const errorText = await createPlaylistResponse.text()
        console.error("Failed to create Tidal playlist:", errorText)
        throw new Error(`Failed to create Tidal playlist: ${errorText}`)
      }

      const tidalPlaylistData = await createPlaylistResponse.json()
      console.log("Tidal playlist created:", tidalPlaylistData)

      // Extract playlist ID from response
      const tidalPlaylistId = tidalPlaylistData.data?.id || tidalPlaylistData.id
      if (!tidalPlaylistId) {
        console.error("No playlist ID in response:", tidalPlaylistData)
        throw new Error("Failed to get playlist ID from Tidal response")
      }

      console.log("Tidal playlist ID:", tidalPlaylistId)

      // Process tracks and collect statistics
      const foundTracks: string[] = []
      let processed = 0
      let found = 0
      let notFound = 0
      let skipped = 0
      const skippedReasons: string[] = []

      for (let i = 0; i < tracks.length; i++) {
        const trackEntry = tracks[i]
        const track = trackEntry?.track

        // Check for various reasons a track might be skipped
        if (!track) {
          skipped++
          skippedReasons.push("Empty track entry")
          console.warn(`Skipping empty track entry at position ${i + 1}`)
          processed++
          setTrackStats({
            total: tracks.length,
            processed,
            found,
            notFound,
            skipped,
            skippedReasons: [...new Set(skippedReasons)],
          })
          setProgress(((i + 1) / tracks.length) * 90)
          continue
        }

        if (track.is_local) {
          skipped++
          skippedReasons.push("Local file (not on Spotify)")
          console.warn(`Skipping local file: ${track.name}`)
          processed++
          setTrackStats({
            total: tracks.length,
            processed,
            found,
            notFound,
            skipped,
            skippedReasons: [...new Set(skippedReasons)],
          })
          setProgress(((i + 1) / tracks.length) * 90)
          continue
        }

        if (!track.name || !track.artists?.[0]?.name) {
          skipped++
          skippedReasons.push("Missing track name or artist")
          console.warn(`Skipping track with missing metadata:`, track)
          processed++
          setTrackStats({
            total: tracks.length,
            processed,
            found,
            notFound,
            skipped,
            skippedReasons: [...new Set(skippedReasons)],
          })
          setProgress(((i + 1) / tracks.length) * 90)
          continue
        }

        if (track.type && track.type !== "track") {
          skipped++
          skippedReasons.push(`${track.type} (not a music track)`)
          console.warn(`Skipping non-track item: ${track.type} - ${track.name}`)
          processed++
          setTrackStats({
            total: tracks.length,
            processed,
            found,
            notFound,
            skipped,
            skippedReasons: [...new Set(skippedReasons)],
          })
          setProgress(((i + 1) / tracks.length) * 90)
          continue
        }

        // Create multiple search queries with different formats
        const searchQueries = [
          `${track.name} ${track.artists[0].name}`,
          `${track.artists[0].name} ${track.name}`,
          track.name, // Just the track name as fallback
        ]

        let foundMatch = false

        for (const searchQuery of searchQueries) {
          if (foundMatch) break

          setCurrentTrack(`${track.name} - ${track.artists[0].name}`)

          try {
            console.log(`Searching for track ${i + 1}/${tracks.length}:`, searchQuery)

            // Search for track on Tidal
            const searchResponse = await fetch(`/api/tidal/search?q=${encodeURIComponent(searchQuery)}`, {
              headers: {
                Authorization: `Bearer ${tidalToken}`,
              },
            })

            if (searchResponse.ok) {
              const searchData = await searchResponse.json()

              // Handle the search response structure from the v2 API
              if (searchData.data?.relationships?.topHits?.data && searchData.included) {
                const topHits = searchData.data.relationships.topHits.data
                const trackHit = topHits.find((hit: any) => hit.type === "tracks")

                if (trackHit) {
                  const trackData = searchData.included.find(
                    (item: any) => item.id === trackHit.id && item.type === "tracks",
                  )
                  if (trackData) {
                    foundTracks.push(trackData.id)
                    found++
                    console.log(`Found match: ${trackData.id}`)
                    foundMatch = true
                    break
                  }
                }
              }
            } else {
              const errorText = await searchResponse.text()
              console.error(`Search failed for "${searchQuery}":`, errorText)
            }
          } catch (error) {
            console.error(`Failed to search for track: ${searchQuery}`, error)
          }

          // Small delay between search attempts
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        if (!foundMatch) {
          console.warn("No match found for:", track.name, "by", track.artists[0].name)
          notFound++
          setErrorDetails((prev) => [...prev, `No match: ${track.name} - ${track.artists[0].name}`])
        }

        processed++
        setTrackStats({
          total: tracks.length,
          processed,
          found,
          notFound,
          skipped,
          skippedReasons: [...new Set(skippedReasons)],
        })

        setProgress(((i + 1) / tracks.length) * 90) // Reserve 10% for adding tracks

        // Add delay between searches to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Add all found tracks to the playlist in batches
      if (foundTracks.length > 0) {
        console.log(`Adding ${foundTracks.length} tracks to playlist...`)
        setCurrentTrack("Adding tracks to playlist...")

        // Add tracks in smaller batches to avoid API limits
        const batchSize = 3 // Even smaller batch size
        for (let i = 0; i < foundTracks.length; i += batchSize) {
          const batch = foundTracks.slice(i, i + batchSize)

          try {
            const addResponse = await fetch(`/api/tidal/playlists/${tidalPlaylistId}/tracks`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tidalToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                trackIds: batch,
              }),
            })

            if (!addResponse.ok) {
              const errorText = await addResponse.text()
              console.error("Failed to add tracks batch:", errorText)
              // Try individual track additions if batch fails
              for (const trackId of batch) {
                try {
                  const singleAddResponse = await fetch(`/api/tidal/playlists/${tidalPlaylistId}/tracks`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${tidalToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      trackIds: [trackId],
                    }),
                  })
                  if (singleAddResponse.ok) {
                    console.log(`Added individual track: ${trackId}`)
                  } else {
                    const singleErrorText = await singleAddResponse.text()
                    console.error(`Failed to add individual track ${trackId}:`, singleErrorText)
                  }
                } catch (singleError) {
                  console.error(`Error adding individual track ${trackId}:`, singleError)
                }
                await new Promise((resolve) => setTimeout(resolve, 300))
              }
            } else {
              console.log(`Added batch of ${batch.length} tracks`)
            }
          } catch (error) {
            console.error("Error adding tracks batch:", error)
          }

          // Add delay between batches to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      setProgress(100)
      onStatusChange("completed")
      console.log("Playlist rebuild completed!")
    } catch (error) {
      console.error("Failed to rebuild playlist:", error)
      setErrorDetails((prev) => [...prev, error instanceof Error ? error.message : "Unknown error"])
      onStatusChange("error")
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
              {playlist.images?.[0] ? (
                <img
                  src={playlist.images[0].url || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Music className="h-6 w-6 text-gray-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-white">{playlist.name}</CardTitle>
              <CardDescription className="text-gray-500">{playlist.tracks.total} tracks</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "copying" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">Processing</span>
              </div>
              <p className="text-sm text-gray-300 mb-3 truncate">{currentTrack}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-green-400 font-medium">✓ {trackStats.found} found</span>
                  <span className="text-red-400 font-medium block">✗ {trackStats.notFound} not found</span>
                </div>
                <div className="space-y-1">
                  <span className="text-yellow-400 font-medium">⚠ {trackStats.skipped} skipped</span>
                  <span className="text-gray-400 font-medium block">
                    {trackStats.processed}/{trackStats.total} processed
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <span className="font-medium text-green-400 text-lg">Playlist rebuilt successfully!</span>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-gray-300">
                  <span className="text-green-400 font-medium">{trackStats.found} tracks</span> found and added to Tidal
                </p>
                {trackStats.notFound > 0 && (
                  <p className="text-gray-300">
                    <span className="text-red-400 font-medium">{trackStats.notFound} tracks</span> not found on Tidal
                  </p>
                )}
                {trackStats.skipped > 0 && (
                  <details className="text-gray-300">
                    <summary className="cursor-pointer hover:text-gray-200">
                      <span className="text-yellow-400 font-medium">{trackStats.skipped} tracks</span> skipped
                    </summary>
                    <div className="mt-2 ml-4 text-sm text-gray-400">
                      <p className="mb-1">Reasons:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {trackStats.skippedReasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <span className="font-medium text-red-400 text-lg">Failed to rebuild playlist</span>
            </div>
            {errorDetails.length > 0 && (
              <details className="mt-3 ml-11">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">View details</summary>
                <div className="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 max-h-32 overflow-y-auto">
                  {errorDetails.slice(-5).map((error, index) => (
                    <div key={index} className="mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <Button
          onClick={handleCopyPlaylist}
          disabled={status === "copying"}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3"
        >
          <Play className="h-4 w-4 mr-2" />
          {status === "copying" ? "Rebuilding..." : "Start Rebuild"}
        </Button>
      </CardContent>
    </Card>
  )
}
