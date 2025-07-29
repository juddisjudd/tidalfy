"use client"

import { Github, Coffee, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://ko-fi.com/ohitsjudd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                <Coffee className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Support on Ko-fi</span>
            </a>

            <div className="w-px h-6 bg-gray-700"></div>

            <a
              href="https://github.com/juddisjudd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <Github className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">GitHub</span>
            </a>

            <div className="w-px h-6 bg-gray-700"></div>

            <a
              href="https://discord.tidalfy.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Join Discord</span>
            </a>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-xs text-gray-500 max-w-md">
            <p>
              Tidalfy is not affiliated with Spotify or Tidal. This tool helps you rebuild playlists by finding matching
              tracks across platforms.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
