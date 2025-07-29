# 🎵 Tidalfy

**Rebuild your Spotify playlists on Tidal with ease**

Tidalfy is a web application that helps you seamlessly transfer your favorite Spotify playlists to Tidal by finding matching tracks across both platforms.

## Features
- 🔐 **Secure OAuth Authentication** - Connect safely to both Spotify and Tidal
- 📊 **Real-time Progress Tracking** - Watch your playlist rebuild with detailed statistics
- 🌙 **Dark AMOLED Theme** - Beautiful, eye-friendly interface
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔄 **Batch Processing** - Efficiently handles large playlists
- 📈 **Detailed Analytics** - See exactly what tracks were found, skipped, or missed

## Getting Started

### Prerequisites

- Node.js and pnpm
- Spotify Developer Account
- Tidal Developer Account

### Environment Variables

Rename/copy the `.env.template` to `.env`file in the root directory:

```env
# Spotify API credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Tidal API credentials  
TIDAL_CLIENT_ID=your_tidal_client_id
TIDAL_CLIENT_SECRET=your_tidal_client_secret
NEXT_PUBLIC_TIDAL_CLIENT_ID=your_tidal_client_id

# Base URL for OAuth callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/juddisjudd/tidalfy.git
   cd tidalfy
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Spotify App**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add redirect URI: `http://localhost:3000/auth/spotify/callback`
   - Copy Client ID and Client Secret to `.env`

4. **Set up Tidal App**
   - Go to [Tidal Developer Portal](https://developer.tidal.com/)
   - Create a new app
   - Add redirect URI: `http://localhost:3000/auth/tidal/callback`
   - Copy Client ID and Client Secret to `.env`

5. **Run the development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: OAuth 2.0 with PKCE
- **APIs**: Spotify Web API, Tidal OpenAPI v2

## 📖 How It Works

1. **Connect Accounts** - Authenticate with both Spotify and Tidal using OAuth
2. **Select Playlist** - Choose any of your Spotify playlists to rebuild
3. **Smart Matching** - The app searches Tidal for each track using multiple strategies:
   - Artist + Track name
   - Track name + Artist
   - Track name only (fallback)
4. **Create & Populate** - Creates a new playlist on Tidal and adds all found tracks
5. **Review Results** - See detailed statistics about the rebuild process

## 🔒 Privacy & Security

- **No Data Storage** - Your music data is never stored on our servers
- **Secure Authentication** - Uses industry-standard OAuth 2.0 with PKCE
- **Local Token Storage** - Authentication tokens are stored locally in your browser

## ⚠️ Current Limitations

- **Development Mode**: Currently in Spotify Development Mode (limited to 25 users)
- **Track Availability**: Some tracks may not be available on Tidal
- **Local Files**: Spotify local files cannot be transferred
- **Rate Limiting**: Large playlists may take longer due to API rate limits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for playlist access
- [Tidal OpenAPI](https://developer.tidal.com/) for music streaming integration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## Support
If you find this project helpful, consider:

- ⭐ Starring the repository
- ☕ [Buying me a coffee](https://ko-fi.com/ohitsjudd)
- 💬 [Joining our Discord](https://discord.tidalfy.net)

---

**Disclaimer**: Tidalfy is not affiliated with Spotify or Tidal. This tool helps you rebuild playlists by finding matching tracks across platforms.
