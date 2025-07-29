export async function refreshSpotifyToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token?: string } | null> {
  try {
    const response = await fetch("/api/auth/spotify/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Spotify token");
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function makeSpotifyRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (refreshToken) {
      const newTokens = await refreshSpotifyToken(refreshToken);
      if (newTokens) {
        localStorage.setItem("spotify_token", newTokens.access_token);
        if (newTokens.refresh_token) {
          localStorage.setItem(
            "spotify_refresh_token",
            newTokens.refresh_token
          );
        }

        return fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${newTokens.access_token}`,
            ...options.headers,
          },
        });
      }
    }
  }

  return response;
}
