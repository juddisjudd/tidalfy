"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Spotify auth error:", error);
        router.push("/?error=spotify_auth_failed");
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        router.push("/?error=no_code");
        return;
      }

      try {
        const response = await fetch("/api/auth/spotify/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for token");
        }

        const data = await response.json();

        // Store both access and refresh tokens
        localStorage.setItem("spotify_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("spotify_refresh_token", data.refresh_token);
        }

        // Redirect back to main page
        router.push("/");
      } catch (error) {
        console.error("Token exchange error:", error);
        router.push("/?error=token_exchange_failed");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">
          Completing Spotify Authentication...
        </h2>
        <p className="text-gray-400">
          Please wait while we finalize your connection.
        </p>
      </div>
    </div>
  );
}
