import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type CreateInventoryItemInput, type InventoryItem } from '../schema';

export const createInventoryItem = async (input: CreateInventoryItemInput): Promise<InventoryItem> => {
  try {
    // Insert inventory item record
    const result = await db.insert(inventoryItemsTable)
      .values({
        itemName: input.itemName,
        quantity: input.quantity
      })
      .returning()
      .execute();

    // Return the created inventory item (no numeric conversions needed for integer columns)
    const inventoryItem = result[0];
    return inventoryItem;
  } catch (error) {
    console.error('Inventory item creation failed:', error);
    throw error;
  }
};