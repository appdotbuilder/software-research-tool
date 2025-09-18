import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  searchProductInputSchema,
  createProductResearchInputSchema,
  updateProductResearchInputSchema,
  exportResearchInputSchema
} from './schema';

// Import handlers
import { searchProduct } from './handlers/search_product';
import { saveResearch } from './handlers/save_research';
import { getSavedResearch } from './handlers/get_saved_research';
import { getResearchById } from './handlers/get_research_by_id';
import { updateResearch } from './handlers/update_research';
import { deleteResearch } from './handlers/delete_research';
import { exportResearch } from './handlers/export_research';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Search for product information and analyze it
  searchProduct: publicProcedure
    .input(searchProductInputSchema)
    .mutation(({ input }) => searchProduct(input)),

  // Save research results to database
  saveResearch: publicProcedure
    .input(createProductResearchInputSchema)
    .mutation(({ input }) => saveResearch(input)),

  // Get all saved research results
  getSavedResearch: publicProcedure
    .query(() => getSavedResearch()),

  // Get specific research by ID
  getResearchById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getResearchById(input.id)),

  // Update existing research
  updateResearch: publicProcedure
    .input(updateProductResearchInputSchema)
    .mutation(({ input }) => updateResearch(input)),

  // Delete research by ID
  deleteResearch: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteResearch(input.id)),

  // Export research in different formats
  exportResearch: publicProcedure
    .input(exportResearchInputSchema)
    .mutation(({ input }) => exportResearch(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();