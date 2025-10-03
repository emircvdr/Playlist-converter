import { z } from "zod";

import { publicProcedure, router } from "../trpc";
import { generateAppleDeveloperToken } from "@/lib/helpers/generateDevToken";

export const appleMusicRouter = router({
  getDeveloperToken: publicProcedure.query(async () => {
    return { token: generateAppleDeveloperToken() };
  }),

  getLibraryPlaylists: publicProcedure
    .input(
      z.object({
        userToken: z.string().min(10),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const params = new URLSearchParams();
      if (input.limit) params.set("limit", String(input.limit));
      if (input.offset) params.set("offset", String(input.offset));

      const res = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists${
          params.toString() ? `?${params.toString()}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${generateAppleDeveloperToken()}`,
            "Music-User-Token": input.userToken,
          },
        }
      );
      if (!res.ok) {
        throw new Error(
          `Apple me/library/playlists ${res.status} ${await res
            .text()
            .catch(() => "")}`
        );
      }
      return await res.json();
    }),

  searchCatalogPlaylists: publicProcedure
    .input(
      z.object({
        storefront: z.string().default("tr"),
        term: z.string().min(1),
        limit: z.number().min(1).max(25).optional(),
      })
    )
    .query(async ({ input }) => {
      const q = new URLSearchParams({
        term: input.term,
        types: "playlists",
        limit: String(input.limit ?? 10),
      });
      const res = await fetch(
        `https://api.music.apple.com/v1/catalog/${input.storefront}/search?${q}`,
        {
          headers: { Authorization: `Bearer ${generateAppleDeveloperToken()}` },
        }
      );
      if (!res.ok) {
        throw new Error(
          `Apple catalog search ${res.status} ${await res
            .text()
            .catch(() => "")}`
        );
      }
      return await res.json();
    }),
  createApplePlaylist: publicProcedure
    .input(
      z.object({
        userToken: z.string().min(10),
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
        seedSongIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const devToken = generateAppleDeveloperToken();

      const body: {
        attributes: {
          name: string;
          description?: string;
          isPublic?: boolean;
        };
        relationships?: { tracks: { data: { id: string; type: string }[] } };
      } = {
        attributes: {
          name: input.name,
          ...(input.description ? { description: input.description } : {}),
          ...(typeof input.isPublic === "boolean"
            ? { isPublic: input.isPublic }
            : {}),
        },
      };

      if (input.seedSongIds?.length) {
        body.relationships = {
          tracks: {
            data: input.seedSongIds.map((id) => ({ id, type: "songs" })),
          },
        };
      }

      const res = await fetch(
        "https://api.music.apple.com/v1/me/library/playlists",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${devToken}`,
            "Music-User-Token": input.userToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Apple create playlist ${res.status} ${txt}`);
      }
      return await res.json();
    }),
});
