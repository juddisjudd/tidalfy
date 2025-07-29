"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Music, CheckCircle, LogOut } from "lucide-react"

interface SpotifyAuthProps {
  token: string | null
  onAuth: (token: string) => void
  onLogout: () => void
}

export function SpotifyAuth({ token, onAuth, onLogout }: SpotifyAuthProps) {
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    try {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/spotify/callback`
      const scopes = ["playlist-read-private", "playlist-read-collaborative"]

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        scope: scopes.join(" "),
        redirect_uri: redirectUri,
        state: Math.random().toString(36).substring(7),
      })

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
    } catch (error) {
      console.error("Auth error:", error)
      setLoading(false)
    }
  }

  if (token) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-green-400" />
              <span className="font-medium text-white">Spotify</span>
            </div>
            <span className="text-sm text-green-400">Connected</span>
          </div>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
        <Music className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-gray-300">Spotify</span>
        <Button
          onClick={handleAuth}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="text-green-400 hover:text-green-300 hover:bg-green-400/10 p-0 h-auto justify-start"
        >
          {loading ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            "Connect"
          )}
        </Button>
      </div>
    </div>
  )
}
