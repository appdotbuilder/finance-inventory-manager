import { z } from 'zod';

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  customerName: z.string(),
  loanAmount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Input schema for creating transactions
export const createTransactionInputSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  loanAmount: z.number().positive('Loan amount must be positive')
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

// Input schema for updating transactions
export const updateTransactionInputSchema = z.object({
  id: z.number(),
  customerName: z.string().min(1, 'Customer name is required').optional(),
  loanAmount: z.number().positive('Loan amount must be positive').optional()
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionInputSchema>;

// Inventory item schema
export const inventoryItemSchema = z.object({
  id: z.number(),
  itemName: z.string(),
  quantity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

// Input schema for creating inventory items
export const createInventoryItemInputSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().nonnegative('Quantity must be non-negative')
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemInputSchema>;

// Input schema for updating inventory items
export const updateInventoryItemInputSchema = z.object({
  id: z.number(),
  itemName: z.string().min(1, 'Item name is required').optional(),
  quantity: z.number().int().nonnegative('Quantity must be non-negative').optional()
});

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemInputSchema>;

// Transaction summary schema for reporting
export const transactionSummarySchema = z.object({
  totalCustomers: z.number(),
  totalTransactions: z.number(),
  totalLoanAmount: z.number()
});

export type TransactionSummary = z.infer<typeof transactionSummarySchema>;

// Inventory summary schema for reporting
export const inventorySummarySchema = z.object({
  totalItemTypes: z.number(),
  totalStockQuantity: z.number()
});

export type InventorySummary = z.infer<typeof inventorySummarySchema>;

// Chart data schemas
export const transactionChartDataSchema = z.object({
  customerName: z.string(),
  loanAmount: z.number()
});

export type TransactionChartData = z.infer<typeof transactionChartDataSchema>;

export const inventoryChartDataSchema = z.object({
  itemName: z.string(),
  quantity: z.number()
});

export type InventoryChartData = z.infer<typeof inventoryChartDataSchema>;

// Delete input schemas
export const deleteTransactionInputSchema = z.object({
  id: z.number()
});

export type DeleteTransactionInput = z.infer<typeof deleteTransactionInputSchema>;

export const deleteInventoryItemInputSchema = z.object({
  id: z.number()
});

export type DeleteInventoryItemInput = z.infer<typeof deleteInventoryItemInputSchema>;