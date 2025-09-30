import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "No authorization header" },
      { status: 401 }
    );
  }

  const requestUrl = "https://api.spotify.com/v1/me";
  const response = await fetch(requestUrl, {
    headers: {
      Authorization: authHeader, // Just pass it through as-is
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}
