import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type CreateInventoryItemInput } from '../schema';
import { createInventoryItem } from '../handlers/create_inventory_item';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateInventoryItemInput = {
  itemName: 'Test Widget',
  quantity: 50
};

describe('createInventoryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an inventory item', async () => {
    const result = await createInventoryItem(testInput);

    // Basic field validation
    expect(result.itemName).toEqual('Test Widget');
    expect(result.quantity).toEqual(50);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    
    // Verify quantity is a number (integer column)
    expect(typeof result.quantity).toBe('number');
  });

  it('should save inventory item to database', async () => {
    const result = await createInventoryItem(testInput);

    // Query using proper drizzle syntax
    const items = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].itemName).toEqual('Test Widget');
    expect(items[0].quantity).toEqual(50);
    expect(items[0].createdAt).toBeInstanceOf(Date);
    expect(items[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should create inventory item with zero quantity', async () => {
    const zeroQuantityInput: CreateInventoryItemInput = {
      itemName: 'Zero Stock Item',
      quantity: 0
    };

    const result = await createInventoryItem(zeroQuantityInput);

    expect(result.itemName).toEqual('Zero Stock Item');
    expect(result.quantity).toEqual(0);
    expect(result.id).toBeDefined();

    // Verify in database
    const items = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toEqual(0);
  });

  it('should create inventory item with large quantity', async () => {
    const largeQuantityInput: CreateInventoryItemInput = {
      itemName: 'Bulk Item',
      quantity: 99999
    };

    const result = await createInventoryItem(largeQuantityInput);

    expect(result.itemName).toEqual('Bulk Item');
    expect(result.quantity).toEqual(99999);
    expect(result.id).toBeDefined();

    // Verify in database
    const items = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toEqual(99999);
  });

  it('should handle special characters in item name', async () => {
    const specialCharsInput: CreateInventoryItemInput = {
      itemName: 'Special Item! @#$%^&*()',
      quantity: 25
    };

    const result = await createInventoryItem(specialCharsInput);

    expect(result.itemName).toEqual('Special Item! @#$%^&*()');
    expect(result.quantity).toEqual(25);

    // Verify in database
    const items = await db.select()
      .from(inventoryItemsTable)
      .where(eq(inventoryItemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].itemName).toEqual('Special Item! @#$%^&*()');
  });

  it('should create multiple inventory items independently', async () => {
    const input1: CreateInventoryItemInput = {
      itemName: 'Item One',
      quantity: 10
    };

    const input2: CreateInventoryItemInput = {
      itemName: 'Item Two',
      quantity: 20
    };

    const result1 = await createInventoryItem(input1);
    const result2 = await createInventoryItem(input2);

    // Verify both items were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.itemName).toEqual('Item One');
    expect(result2.itemName).toEqual('Item Two');
    expect(result1.quantity).toEqual(10);
    expect(result2.quantity).toEqual(20);

    // Verify both items exist in database
    const allItems = await db.select()
      .from(inventoryItemsTable)
      .execute();

    expect(allItems).toHaveLength(2);
    
    const itemNames = allItems.map(item => item.itemName);
    expect(itemNames).toContain('Item One');
    expect(itemNames).toContain('Item Two');
  });
});