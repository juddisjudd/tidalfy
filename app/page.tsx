"use client"

import { useState, useEffect } from "react"
import { SpotifyAuth } from "@/components/spotify-auth"
import { TidalAuth } from "@/components/tidal-auth"
import { PlaylistSelector } from "@/components/playlist-selector"
import { CopyProgress } from "@/components/copy-progress"
import { Footer } from "@/components/footer"
import { AuthSkeleton } from "@/components/auth-skeleton"
import { CopyProgressSkeleton } from "@/components/copy-progress-skeleton"
import { OpenSourceModal } from "@/components/open-source-modal"

export default function Home() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [tidalToken, setTidalToken] = useState<string | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "completed" | "error">("idle")
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Check for stored tokens
    const storedSpotifyToken = localStorage.getItem("spotify_token")
    const storedTidalToken = localStorage.getItem("tidal_token")

    // Add a small delay to prevent flash of content
    const timer = setTimeout(() => {
      if (storedSpotifyToken) {
        setSpotifyToken(storedSpotifyToken)
      }
      if (storedTidalToken) {
        setTidalToken(storedTidalToken)
      }

      // Set loading to false after checking localStorage and setting tokens
      setIsInitialLoading(false)
    }, 100) // Small delay to prevent flash

    return () => clearTimeout(timer)
  }, [])

  const handleSpotifyAuth = (token: string) => {
    setSpotifyToken(token)
    localStorage.setItem("spotify_token", token)
  }

  const handleTidalAuth = (token: string) => {
    setTidalToken(token)
    localStorage.setItem("tidal_token", token)
  }

  const handleLogout = (service: "spotify" | "tidal") => {
    if (service === "spotify") {
      setSpotifyToken(null)
      localStorage.removeItem("spotify_token")
      localStorage.removeItem("spotify_refresh_token")
      setSelectedPlaylist(null)
    } else {
      setTidalToken(null)
      localStorage.removeItem("tidal_token")
    }
    setCopyStatus("idle")
  }

  const handleSpotifyTokenExpired = () => {
    handleLogout("spotify")
  }

  // Show loading state during initial setup
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-emerald-400 via-teal-400 via-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                Tidalfy
              </h1>
              <p className="text-gray-400 text-lg">Rebuild your Spotify playlists on Tidal</p>
            </div>

            {/* Auth Status - Loading */}
            <div className="flex items-center justify-center gap-8 mb-12">
              <AuthSkeleton />
              <div className="w-px h-12 bg-gradient-to-b from-green-400 to-blue-500"></div>
              <AuthSkeleton />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <OpenSourceModal />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-emerald-400 via-teal-400 via-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              Tidalfy
            </h1>
            <p className="text-gray-400 text-lg">Rebuild your Spotify playlists on Tidal</p>
          </div>

          {/* Auth Status */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <SpotifyAuth token={spotifyToken} onAuth={handleSpotifyAuth} onLogout={() => handleLogout("spotify")} />
            <div className="w-px h-12 bg-gradient-to-b from-green-400 to-blue-500"></div>
            <TidalAuth token={tidalToken} onAuth={handleTidalAuth} onLogout={() => handleLogout("tidal")} />
          </div>

          {/* Main Content - Side by Side Layout */}
          {spotifyToken && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Playlist Selector */}
              <div className="space-y-6">
                <PlaylistSelector
                  token={spotifyToken}
                  onPlaylistSelect={setSelectedPlaylist}
                  onTokenExpired={handleSpotifyTokenExpired}
                />
              </div>

              {/* Right Column - Rebuild Progress */}
              <div className="space-y-6">
                {selectedPlaylist && spotifyToken && tidalToken ? (
                  <CopyProgress
                    spotifyToken={spotifyToken}
                    tidalToken={tidalToken}
                    playlist={selectedPlaylist}
                    status={copyStatus}
                    onStatusChange={setCopyStatus}
                    onBack={() => setSelectedPlaylist(null)}
                  />
                ) : selectedPlaylist && (!spotifyToken || !tidalToken) ? (
                  <CopyProgressSkeleton />
                ) : (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center min-h-[400px] flex flex-col justify-center">
                    <div className="text-gray-500 mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400/20 to-blue-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-50"></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to Rebuild</h3>
                    <p className="text-gray-500">
                      {!tidalToken
                        ? "Connect to Tidal to get started"
                        : "Select a playlist from the left to begin rebuilding"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Initial State - No Spotify Connection */}
          {!spotifyToken && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400/20 to-blue-500/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-50"></div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-200 mb-3">Get Started</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Connect your Spotify account to view your playlists and start rebuilding them on Tidal
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
