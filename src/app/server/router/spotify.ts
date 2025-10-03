import {
  CLIENT_ID,
  generateRandomString,
  REDIRECT_URI,
  SPOTIFY_AUTH_URL,
  SPOTIFY_SCOPES,
} from "@/lib/spotify";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";

const spotifyRouter = router({
  spotifyAuth: publicProcedure.query(async ({ ctx }) => {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SPOTIFY_SCOPES,
      redirect_uri: REDIRECT_URI,
      state: generateRandomString(16),
    });
    const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    return authUrl as string;
  }),
  getUser: publicProcedure
    .input(z.object({ accessToken: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      const userPlaylist = await fetch(
        `https://api.spotify.com/v1/users/${data.id}/playlists`,
        {
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
          },
        }
      );

      const userPlaylistData = await userPlaylist.json();

      return { user: data, userPlaylist: userPlaylistData };
    }),
  getPlaylist: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${input.id}`,
        {
          headers: {
            Authorization: `Bearer ${input.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      return { playlist: data };
    }),
});

export default spotifyRouter;
