"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Github, Heart, Code, Users, MessageCircle } from "lucide-react"

export function OpenSourceModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed this modal
    const hasSeenModal = localStorage.getItem("tidalfy-open-source-modal-dismissed")
    if (!hasSeenModal) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem("tidalfy-open-source-modal-dismissed", "true")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-md w-full mx-4 relative">
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Now Open Source!</CardTitle>
              <CardDescription className="text-gray-400">Tidalfy is now available on GitHub</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              Due to Spotify's API limitations in development mode, we've decided to open source Tidalfy so the
              community can contribute and help improve the experience for everyone.
            </p>

            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">What this means:</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1 ml-6">
                <li>• You can run your own instance</li>
                <li>• No user limits with your own API keys</li>
                <li>• Community-driven improvements</li>
                <li>• Full transparency and control</li>
              </ul>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">Need help?</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Join our Discord for setup assistance, troubleshooting, or to request temporary membership to process
                directly on tidalfy (100% Free)!
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.open("https://github.com/juddisjudd/tidalfy", "_blank")}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open("https://discord.tidalfy.net", "_blank")}
                variant="outline"
                className="flex-1 bg-indigo-500/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Heart className="h-4 w-4 mr-2" />
                Got it!
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
