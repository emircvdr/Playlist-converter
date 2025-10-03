import { appleMusicRouter } from "./router/apple";
import spotifyRouter from "./router/spotify";
import { router } from "./trpc";
export const appRouter = router({
  // ...
  spotify: spotifyRouter,
  appleMusic: appleMusicRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
