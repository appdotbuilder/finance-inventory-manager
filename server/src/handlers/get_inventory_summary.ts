import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type InventorySummary } from '../schema';
import { count, sum } from 'drizzle-orm';

export const getInventorySummary = async (): Promise<InventorySummary> => {
  try {
    // Get total count of inventory item types and sum of all quantities
    const result = await db.select({
      totalItemTypes: count(inventoryItemsTable.id),
      totalStockQuantity: sum(inventoryItemsTable.quantity)
    })
    .from(inventoryItemsTable)
    .execute();

    const summary = result[0];
    
    return {
      totalItemTypes: summary.totalItemTypes || 0,
      totalStockQuantity: parseInt(summary.totalStockQuantity?.toString() || '0', 10)
    };
  } catch (error) {
    console.error('Inventory summary calculation failed:', error);
    throw error;
  }
};