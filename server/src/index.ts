import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createTransactionInputSchema,
  updateTransactionInputSchema,
  deleteTransactionInputSchema,
  createInventoryItemInputSchema,
  updateInventoryItemInputSchema,
  deleteInventoryItemInputSchema
} from './schema';

// Import handlers - Transaction management
import { createTransaction } from './handlers/create_transaction';
import { getTransactions } from './handlers/get_transactions';
import { updateTransaction } from './handlers/update_transaction';
import { deleteTransaction } from './handlers/delete_transaction';

// Import handlers - Inventory management
import { createInventoryItem } from './handlers/create_inventory_item';
import { getInventoryItems } from './handlers/get_inventory_items';
import { updateInventoryItem } from './handlers/update_inventory_item';
import { deleteInventoryItem } from './handlers/delete_inventory_item';

// Import handlers - Reporting dashboard
import { getTransactionSummary } from './handlers/get_transaction_summary';
import { getInventorySummary } from './handlers/get_inventory_summary';
import { getTransactionChartData } from './handlers/get_transaction_chart_data';
import { getInventoryChartData } from './handlers/get_inventory_chart_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Transaction management routes
  createTransaction: publicProcedure
    .input(createTransactionInputSchema)
    .mutation(({ input }) => createTransaction(input)),
  
  getTransactions: publicProcedure
    .query(() => getTransactions()),
  
  updateTransaction: publicProcedure
    .input(updateTransactionInputSchema)
    .mutation(({ input }) => updateTransaction(input)),
  
  deleteTransaction: publicProcedure
    .input(deleteTransactionInputSchema)
    .mutation(({ input }) => deleteTransaction(input)),

  // Inventory management routes
  createInventoryItem: publicProcedure
    .input(createInventoryItemInputSchema)
    .mutation(({ input }) => createInventoryItem(input)),
  
  getInventoryItems: publicProcedure
    .query(() => getInventoryItems()),
  
  updateInventoryItem: publicProcedure
    .input(updateInventoryItemInputSchema)
    .mutation(({ input }) => updateInventoryItem(input)),
  
  deleteInventoryItem: publicProcedure
    .input(deleteInventoryItemInputSchema)
    .mutation(({ input }) => deleteInventoryItem(input)),

  // Reporting dashboard routes
  getTransactionSummary: publicProcedure
    .query(() => getTransactionSummary()),
  
  getInventorySummary: publicProcedure
    .query(() => getInventorySummary()),
  
  getTransactionChartData: publicProcedure
    .query(() => getTransactionChartData()),
  
  getInventoryChartData: publicProcedure
    .query(() => getInventoryChartData()),
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