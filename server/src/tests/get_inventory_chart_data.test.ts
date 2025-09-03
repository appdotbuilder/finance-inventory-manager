import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { getInventoryChartData } from '../handlers/get_inventory_chart_data';

describe('getInventoryChartData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no inventory items exist', async () => {
    const result = await getInventoryChartData();
    
    expect(result).toEqual([]);
  });

  it('should return single inventory item for chart', async () => {
    // Create test inventory item
    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Test Widget',
        quantity: 50
      })
      .execute();

    const result = await getInventoryChartData();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      itemName: 'Test Widget',
      quantity: 50
    });
    expect(typeof result[0].quantity).toBe('number');
  });

  it('should return multiple inventory items for chart', async () => {
    // Create multiple test inventory items
    const testItems = [
      { itemName: 'Widget A', quantity: 100 },
      { itemName: 'Widget B', quantity: 75 },
      { itemName: 'Widget C', quantity: 25 },
      { itemName: 'Widget D', quantity: 0 }
    ];

    await db.insert(inventoryItemsTable)
      .values(testItems)
      .execute();

    const result = await getInventoryChartData();

    expect(result).toHaveLength(4);
    
    // Verify all items are returned with correct structure
    result.forEach(item => {
      expect(item).toHaveProperty('itemName');
      expect(item).toHaveProperty('quantity');
      expect(typeof item.itemName).toBe('string');
      expect(typeof item.quantity).toBe('number');
    });

    // Check specific items exist in results
    expect(result.find(item => item.itemName === 'Widget A')?.quantity).toBe(100);
    expect(result.find(item => item.itemName === 'Widget B')?.quantity).toBe(75);
    expect(result.find(item => item.itemName === 'Widget C')?.quantity).toBe(25);
    expect(result.find(item => item.itemName === 'Widget D')?.quantity).toBe(0);
  });

  it('should handle zero quantity items correctly', async () => {
    // Create items with zero and positive quantities
    await db.insert(inventoryItemsTable)
      .values([
        { itemName: 'Out of Stock Item', quantity: 0 },
        { itemName: 'In Stock Item', quantity: 10 }
      ])
      .execute();

    const result = await getInventoryChartData();

    expect(result).toHaveLength(2);
    
    const outOfStockItem = result.find(item => item.itemName === 'Out of Stock Item');
    const inStockItem = result.find(item => item.itemName === 'In Stock Item');

    expect(outOfStockItem).toBeDefined();
    expect(outOfStockItem?.quantity).toBe(0);
    expect(inStockItem).toBeDefined();
    expect(inStockItem?.quantity).toBe(10);
  });

  it('should return data optimized for chart visualization', async () => {
    // Create inventory items with various quantities for chart
    const chartTestData = [
      { itemName: 'High Volume Item', quantity: 1000 },
      { itemName: 'Medium Volume Item', quantity: 500 },
      { itemName: 'Low Volume Item', quantity: 50 },
      { itemName: 'Minimal Volume Item', quantity: 1 }
    ];

    await db.insert(inventoryItemsTable)
      .values(chartTestData)
      .execute();

    const result = await getInventoryChartData();

    expect(result).toHaveLength(4);
    
    // Verify chart data structure - should only contain itemName and quantity
    result.forEach(item => {
      const keys = Object.keys(item);
      expect(keys).toHaveLength(2);
      expect(keys).toContain('itemName');
      expect(keys).toContain('quantity');
      
      // Verify no extra fields (like id, createdAt, updatedAt)
      expect(keys).not.toContain('id');
      expect(keys).not.toContain('createdAt');
      expect(keys).not.toContain('updatedAt');
    });

    // Verify data integrity for chart usage
    const totalQuantity = result.reduce((sum, item) => sum + item.quantity, 0);
    expect(totalQuantity).toBe(1551); // 1000 + 500 + 50 + 1
  });
});