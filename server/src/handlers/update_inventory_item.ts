import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type UpdateInventoryItemInput, type InventoryItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInventoryItem = async (input: UpdateInventoryItemInput): Promise<InventoryItem> => {
  try {
    // Build update object only with provided fields
    const updateData: any = {};
    
    if (input.itemName !== undefined) {
      updateData.itemName = input.itemName;
    }
    
    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity;
    }
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update the inventory item
    const result = await db.update(inventoryItemsTable)
      .set(updateData)
      .where(eq(inventoryItemsTable.id, input.id))
      .returning()
      .execute();
    
    // Check if the item was found and updated
    if (result.length === 0) {
      throw new Error(`Inventory item with id ${input.id} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error('Inventory item update failed:', error);
    throw error;
  }
};