export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">
          Authenticating with Spotify...
        </h2>
        <p className="text-gray-400">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}
