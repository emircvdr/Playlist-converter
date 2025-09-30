export const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_SCOPES = ["user-read-private", "user-read-email"].join(
  " "
);

export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
export const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!;
export const POST_LOGIN_REDIRECT = process.env.POST_LOGIN_REDIRECT || "/";

export function base64ClientCreds() {
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

export function generateRandomString(length = 16) {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(length)))
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}
