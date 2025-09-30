import {
  SPOTIFY_AUTH_URL,
  CLIENT_ID,
  SPOTIFY_SCOPES,
  REDIRECT_URI,
  generateRandomString,
} from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET() {
  const state = generateRandomString(16);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  });

  const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
