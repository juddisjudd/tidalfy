"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TidalCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Tidal auth error:", error);
        router.push("/?error=tidal_auth_failed");
        return;
      }

      if (!code) {
        console.error("No authorization code received");
        router.push("/?error=no_code");
        return;
      }

      try {
        const codeVerifier = localStorage.getItem("tidal_code_verifier");
        if (!codeVerifier) {
          throw new Error("No code verifier found");
        }

        const response = await fetch("/api/auth/tidal/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for token");
        }

        const data = await response.json();

        // Store the token
        localStorage.setItem("tidal_token", data.access_token);

        // Clean up code verifier
        localStorage.removeItem("tidal_code_verifier");

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">
          Completing Tidal Authentication...
        </h2>
        <p className="text-gray-400">
          Please wait while we finalize your connection.
        </p>
      </div>
    </div>
  );
}
