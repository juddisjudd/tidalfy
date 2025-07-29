"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Music, Users, Search, RefreshCw, LogOut } from "lucide-react"

interface PlaylistSelectorProps {
  token: string
  onPlaylistSelect: (playlist: any) => void
  onTokenExpired?: () => void
}

export function PlaylistSelector({ token, onPlaylistSelect, onTokenExpired }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<any[]>([])
  const [filteredPlaylists, setFilteredPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [tokenExpired, setTokenExpired] = useState(false)

  const fetchPlaylists = async () => {
    setLoading(true)
    setError(null)
    setTokenExpired(false)

    try {
      const response = await fetch("/api/spotify/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle token expiration specifically
        if (errorData.code === "TOKEN_EXPIRED") {
          setTokenExpired(true)
          setError("Your Spotify session has expired. Please reconnect your account.")
          return
        }

        // Handle 403 - Development app user limit
        if (response.status === 403) {
          setError(
            "Access restricted: This app is in development mode and only allows specific users. Please contact the developer to be added to the user allowlist, or try again later when the app is publicly available.",
          )
          return
        }

        throw new Error(errorData.details || errorData.error || "Failed to fetch playlists")
      }

      const data = await response.json()
      setPlaylists(data.items || [])
      setFilteredPlaylists(data.items || [])
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch playlists"
      setError(errorMessage)
      console.error("Playlist fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [token])

  useEffect(() => {
    const filtered = playlists.filter((playlist) => playlist.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredPlaylists(filtered)
  }, [searchTerm, playlists])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchPlaylists()
  }

  const handleReconnect = () => {
    if (onTokenExpired) {
      onTokenExpired()
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <Music className="h-4 w-4 text-white" />
          </div>
          Choose a Playlist
          {playlists.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">({playlists.length} playlists)</span>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 mb-2">Loading your playlists...</p>
              {retryCount > 0 && <p className="text-gray-500 text-sm">This may take a moment for large collections</p>}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <Music className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-2">Error loading playlists</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>

              {tokenExpired ? (
                <Button onClick={handleReconnect} className="bg-green-600 hover:bg-green-700 text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Reconnect Spotify
                </Button>
              ) : (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
            {retryCount > 2 && !tokenExpired && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg text-left">
                <p className="text-gray-300 text-sm mb-2">Still having trouble?</p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Disconnect and reconnect Spotify</li>
                  <li>• Check your internet connection</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200 group cursor-pointer"
                  onClick={() => onPlaylistSelect(playlist)}
                >
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                    {playlist.images?.[0] ? (
                      <img
                        src={playlist.images[0].url || "/placeholder.svg"}
                        alt={playlist.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Music className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-white group-hover:text-green-400 transition-colors">
                      {playlist.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {playlist.tracks.total} tracks
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {playlist.owner.display_name}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredPlaylists.length === 0 && (
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "No playlists found matching your search." : "No playlists found."}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
