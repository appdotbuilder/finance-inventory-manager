import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type DeleteInventoryItemInput, type CreateInventoryItemInput } from '../schema';
import { deleteInventoryItem } from '../handlers/delete_inventory_item';
import { eq } from 'drizzle-orm';

// Test input for creating inventory items
const testCreateInput: CreateInventoryItemInput = {
  itemName: 'Test Widget',
  quantity: 50
};

describe('deleteInventoryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing inventory item', async () => {
    // First create an inventory item
    const createResult = await db.insert(inventoryItemsTable)
      .values({
        itemName: testCreateInput.itemName,
        quantity: testCreateInput.quantity
      })
      .returning()
      .execute();

    const createdItem = createResult[0];
    expect(createdItem.id).toBeDefined();

    // Now delete the inventory item
    const deleteInput: DeleteInventoryItemInput = {
      id: createdItem.id
    };

    const result = await deleteInventoryItem(deleteInput);

    // Should return success: true
    expect(result.success).toBe(true);

    // Verify item is actually deleted from database
    const remainingItems = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, createdItem.id))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });

  it('should return success false when trying to delete non-existent inventory item', async () => {
    const deleteInput: DeleteInventoryItemInput = {
      id: 999999 // Non-existent ID
    };

    const result = await deleteInventoryItem(deleteInput);

    // Should return success: false since no rows were affected
    expect(result.success).toBe(false);
  });

  it('should not affect other inventory items when deleting one item', async () => {
    // Create multiple inventory items
    const items = [
      { itemName: 'Widget A', quantity: 10 },
      { itemName: 'Widget B', quantity: 20 },
      { itemName: 'Widget C', quantity: 30 }
    ];

    const createResults = [];
    for (const item of items) {
      const result = await db.insert(inventoryItemsTable)
        .values(item)
        .returning()
        .execute();
      createResults.push(result[0]);
    }

    // Delete the middle item
    const deleteInput: DeleteInventoryItemInput = {
      id: createResults[1].id
    };

    const deleteResult = await deleteInventoryItem(deleteInput);
    expect(deleteResult.success).toBe(true);

    // Verify other items still exist
    const remainingItems = await db.select()
      .from(inventoryItemsTable)
      .execute();

    expect(remainingItems).toHaveLength(2);
    
    // Verify the correct items remain
    const remainingNames = remainingItems.map(item => item.itemName).sort();
    expect(remainingNames).toEqual(['Widget A', 'Widget C']);

    // Verify the deleted item is gone
    const deletedItem = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, createResults[1].id))
      .execute();

    expect(deletedItem).toHaveLength(0);
  });

  it('should handle deletion of item with zero quantity', async () => {
    // Create an inventory item with zero quantity
    const createResult = await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Empty Widget',
        quantity: 0
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the zero-quantity item
    const deleteInput: DeleteInventoryItemInput = {
      id: createdItem.id
    };

    const result = await deleteInventoryItem(deleteInput);

    expect(result.success).toBe(true);

    // Verify item is deleted
    const remainingItems = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, createdItem.id))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });

  it('should handle deletion of item with large quantity', async () => {
    // Create an inventory item with large quantity
    const createResult = await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Bulk Widget',
        quantity: 99999
      })
      .returning()
      .execute();

    const createdItem = createResult[0];

    // Delete the high-quantity item
    const deleteInput: DeleteInventoryItemInput = {
      id: createdItem.id
    };

    const result = await deleteInventoryItem(deleteInput);

    expect(result.success).toBe(true);

    // Verify item is deleted
    const remainingItems = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, createdItem.id))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });
});