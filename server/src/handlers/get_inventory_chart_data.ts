import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type InventoryChartData } from '../schema';

export const getInventoryChartData = async (): Promise<InventoryChartData[]> => {
  try {
    // Fetch all inventory items for chart visualization
    const results = await db.select({
      itemName: inventoryItemsTable.itemName,
      quantity: inventoryItemsTable.quantity
    })
    .from(inventoryItemsTable)
    .execute();

    // Return data formatted for chart visualization
    return results.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity // Integer column - no conversion needed
    }));
  } catch (error) {
    console.error('Fetching inventory chart data failed:', error);
    throw error;
  }
};