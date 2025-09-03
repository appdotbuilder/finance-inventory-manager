import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type DeleteInventoryItemInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteInventoryItem = async (input: DeleteInventoryItemInput): Promise<{ success: boolean }> => {
  try {
    // Delete the inventory item by ID
    const result = await db.delete(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, input.id))
      .execute();

    // Check if any rows were affected (item existed and was deleted)
    const success = result.rowCount !== null && result.rowCount > 0;
    
    return { success };
  } catch (error) {
    console.error('Inventory item deletion failed:', error);
    throw error;
  }
};