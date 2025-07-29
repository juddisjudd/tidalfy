import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tidalfy - Rebuild Spotify Playlists on Tidal",
  description:
    "Seamlessly rebuild your Spotify playlists on Tidal. Find matching tracks and recreate your favorite playlists across music streaming platforms.",
  keywords: [
    "Spotify",
    "Tidal",
    "playlist",
    "music",
    "streaming",
    "transfer",
    "rebuild",
    "convert",
  ],
  authors: [{ name: "Judd", url: "https://github.com/juddisjudd" }],
  creator: "Judd",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Tidalfy - Rebuild Spotify Playlists on Tidal",
    description:
      "Seamlessly rebuild your Spotify playlists on Tidal. Find matching tracks and recreate your favorite playlists across music streaming platforms.",
    url: "https://tidalfy.net/",
    siteName: "Tidalfy",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Tidalfy - Rebuild Spotify Playlists on Tidal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tidalfy - Rebuild Spotify Playlists on Tidal",
    description:
      "Seamlessly rebuild your Spotify playlists on Tidal. Find matching tracks and recreate your favorite playlists across music streaming platforms.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
