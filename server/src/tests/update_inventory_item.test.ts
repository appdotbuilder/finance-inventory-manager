import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type UpdateInventoryItemInput, type CreateInventoryItemInput } from '../schema';
import { updateInventoryItem } from '../handlers/update_inventory_item';
import { eq } from 'drizzle-orm';

describe('updateInventoryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test inventory item
  const createTestItem = async (itemData: CreateInventoryItemInput) => {
    const result = await db.insert(inventoryItemsTable)
      .values({
        itemName: itemData.itemName,
        quantity: itemData.quantity
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should update inventory item name only', async () => {
    // Create test item
    const testItem = await createTestItem({
      itemName: 'Original Item',
      quantity: 50
    });

    // Update only the name
    const updateInput: UpdateInventoryItemInput = {
      id: testItem.id,
      itemName: 'Updated Item Name'
    };

    const result = await updateInventoryItem(updateInput);

    // Verify the response
    expect(result.id).toEqual(testItem.id);
    expect(result.itemName).toEqual('Updated Item Name');
    expect(result.quantity).toEqual(50); // Should remain unchanged
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt > testItem.updatedAt).toBe(true);
  });

  it('should update inventory item quantity only', async () => {
    // Create test item
    const testItem = await createTestItem({
      itemName: 'Test Item',
      quantity: 100
    });

    // Update only the quantity
    const updateInput: UpdateInventoryItemInput = {
      id: testItem.id,
      quantity: 75
    };

    const result = await updateInventoryItem(updateInput);

    // Verify the response
    expect(result.id).toEqual(testItem.id);
    expect(result.itemName).toEqual('Test Item'); // Should remain unchanged
    expect(result.quantity).toEqual(75);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt > testItem.updatedAt).toBe(true);
  });

  it('should update both name and quantity', async () => {
    // Create test item
    const testItem = await createTestItem({
      itemName: 'Original Item',
      quantity: 25
    });

    // Update both fields
    const updateInput: UpdateInventoryItemInput = {
      id: testItem.id,
      itemName: 'Completely Updated Item',
      quantity: 150
    };

    const result = await updateInventoryItem(updateInput);

    // Verify the response
    expect(result.id).toEqual(testItem.id);
    expect(result.itemName).toEqual('Completely Updated Item');
    expect(result.quantity).toEqual(150);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt > testItem.updatedAt).toBe(true);
  });

  it('should save updated inventory item to database', async () => {
    // Create test item
    const testItem = await createTestItem({
      itemName: 'Database Test Item',
      quantity: 30
    });

    // Update the item
    const updateInput: UpdateInventoryItemInput = {
      id: testItem.id,
      itemName: 'Updated Database Item',
      quantity: 45
    };

    await updateInventoryItem(updateInput);

    // Verify the database was updated
    const items = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, testItem.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].itemName).toEqual('Updated Database Item');
    expect(items[0].quantity).toEqual(45);
    expect(items[0].updatedAt).toBeInstanceOf(Date);
    expect(items[0].updatedAt > testItem.updatedAt).toBe(true);
  });

  it('should throw error when inventory item does not exist', async () => {
    const updateInput: UpdateInventoryItemInput = {
      id: 999999, // Non-existent ID
      itemName: 'Non-existent Item'
    };

    await expect(updateInventoryItem(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle zero quantity update', async () => {
    // Create test item
    const testItem = await createTestItem({
      itemName: 'Zero Test Item',
      quantity: 10
    });

    // Update quantity to zero
    const updateInput: UpdateInventoryItemInput = {
      id: testItem.id,
      quantity: 0
    };

    const result = await updateInventoryItem(updateInput);

    // Verify zero quantity is properly handled
    expect(result.quantity).toEqual(0);
    expect(result.itemName).toEqual('Zero Test Item'); // Should remain unchanged
  });
});