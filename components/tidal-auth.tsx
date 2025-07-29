"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Waves, CheckCircle, LogOut } from "lucide-react"
import { generateCodeVerifier, generateCodeChallenge } from "@/utils/pkce"

interface TidalAuthProps {
  token: string | null
  onAuth: (token: string) => void
  onLogout: () => void
}

export function TidalAuth({ token, onAuth, onLogout }: TidalAuthProps) {
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    try {
      const clientId = process.env.NEXT_PUBLIC_TIDAL_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/tidal/callback`

      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      // Store code verifier for later use
      localStorage.setItem("tidal_code_verifier", codeVerifier)

      const scopes = ["user.read", "playlists.read", "playlists.write"]

      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        redirect_uri: redirectUri,
        scope: scopes.join(" "),
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: Math.random().toString(36).substring(7),
      })

      window.location.href = `https://login.tidal.com/authorize?${params.toString()}`
    } catch (error) {
      console.error("Auth error:", error)
      setLoading(false)
    }
  }

  if (token) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-white">Tidal</span>
            </div>
            <span className="text-sm text-blue-400">Connected</span>
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
        <Waves className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-gray-300">Tidal</span>
        <Button
          onClick={handleAuth}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-0 h-auto justify-start"
        >
          {loading ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
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
