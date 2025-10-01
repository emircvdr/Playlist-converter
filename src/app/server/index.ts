import spotifyRouter from "./router/spotify";
import { router } from "./trpc";
export const appRouter = router({
  // ...
  spotify: spotifyRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
