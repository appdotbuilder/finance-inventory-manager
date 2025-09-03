import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { type CreateInventoryItemInput } from '../schema';
import { getInventorySummary } from '../handlers/get_inventory_summary';

// Test inventory items
const testItems: CreateInventoryItemInput[] = [
  {
    itemName: 'Widget A',
    quantity: 50
  },
  {
    itemName: 'Widget B', 
    quantity: 25
  },
  {
    itemName: 'Widget C',
    quantity: 100
  }
];

describe('getInventorySummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero summary for empty inventory', async () => {
    const result = await getInventorySummary();

    expect(result.totalItemTypes).toEqual(0);
    expect(result.totalStockQuantity).toEqual(0);
  });

  it('should calculate correct summary with single item', async () => {
    // Create single inventory item
    await db.insert(inventoryItemsTable)
      .values({
        itemName: testItems[0].itemName,
        quantity: testItems[0].quantity
      })
      .execute();

    const result = await getInventorySummary();

    expect(result.totalItemTypes).toEqual(1);
    expect(result.totalStockQuantity).toEqual(50);
  });

  it('should calculate correct summary with multiple items', async () => {
    // Create multiple inventory items
    await db.insert(inventoryItemsTable)
      .values([
        {
          itemName: testItems[0].itemName,
          quantity: testItems[0].quantity
        },
        {
          itemName: testItems[1].itemName,
          quantity: testItems[1].quantity
        },
        {
          itemName: testItems[2].itemName,
          quantity: testItems[2].quantity
        }
      ])
      .execute();

    const result = await getInventorySummary();

    // Should count 3 different item types
    expect(result.totalItemTypes).toEqual(3);
    // Should sum all quantities: 50 + 25 + 100 = 175
    expect(result.totalStockQuantity).toEqual(175);
  });

  it('should handle items with zero quantity', async () => {
    // Create items including one with zero quantity
    await db.insert(inventoryItemsTable)
      .values([
        {
          itemName: 'Item with stock',
          quantity: 30
        },
        {
          itemName: 'Item without stock',
          quantity: 0
        }
      ])
      .execute();

    const result = await getInventorySummary();

    // Should count both items as types, even if one has zero quantity
    expect(result.totalItemTypes).toEqual(2);
    // Should sum quantities: 30 + 0 = 30
    expect(result.totalStockQuantity).toEqual(30);
  });

  it('should handle large quantities correctly', async () => {
    // Create item with large quantity
    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'High volume item',
        quantity: 10000
      })
      .execute();

    const result = await getInventorySummary();

    expect(result.totalItemTypes).toEqual(1);
    expect(result.totalStockQuantity).toEqual(10000);
  });

  it('should return correct types for summary fields', async () => {
    // Create test data
    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Test Item',
        quantity: 42
      })
      .execute();

    const result = await getInventorySummary();

    expect(typeof result.totalItemTypes).toBe('number');
    expect(typeof result.totalStockQuantity).toBe('number');
    expect(result.totalItemTypes).toEqual(1);
    expect(result.totalStockQuantity).toEqual(42);
  });
});