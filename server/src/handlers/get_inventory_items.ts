import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type InventoryItem } from '../schema';

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    // Fetch all inventory items from the database
    const results = await db.select()
      .from(inventoryItemsTable)
      .execute();

    // No numeric conversion needed since quantity is integer
    return results;
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    throw error;
  }
};