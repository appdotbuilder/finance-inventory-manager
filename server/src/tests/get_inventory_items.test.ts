import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryItemsTable } from '../db/schema';
import { getInventoryItems } from '../handlers/get_inventory_items';

describe('getInventoryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no inventory items exist', async () => {
    const result = await getInventoryItems();
    
    expect(result).toEqual([]);
  });

  it('should return all inventory items', async () => {
    // Insert test inventory items
    await db.insert(inventoryItemsTable)
      .values([
        {
          itemName: 'Laptop',
          quantity: 10
        },
        {
          itemName: 'Mouse',
          quantity: 25
        },
        {
          itemName: 'Keyboard',
          quantity: 15
        }
      ])
      .execute();

    const result = await getInventoryItems();

    expect(result).toHaveLength(3);
    
    // Verify structure and types
    result.forEach(item => {
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('number');
      expect(typeof item.itemName).toBe('string');
      expect(typeof item.quantity).toBe('number');
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.updatedAt).toBeInstanceOf(Date);
    });

    // Verify specific items
    const itemNames = result.map(item => item.itemName).sort();
    expect(itemNames).toEqual(['Keyboard', 'Laptop', 'Mouse']);

    const laptop = result.find(item => item.itemName === 'Laptop');
    expect(laptop?.quantity).toBe(10);

    const mouse = result.find(item => item.itemName === 'Mouse');
    expect(mouse?.quantity).toBe(25);

    const keyboard = result.find(item => item.itemName === 'Keyboard');
    expect(keyboard?.quantity).toBe(15);
  });

  it('should handle single inventory item', async () => {
    // Insert single item
    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Monitor',
        quantity: 5
      })
      .execute();

    const result = await getInventoryItems();

    expect(result).toHaveLength(1);
    expect(result[0].itemName).toBe('Monitor');
    expect(result[0].quantity).toBe(5);
    expect(result[0].id).toBeDefined();
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should handle items with zero quantity', async () => {
    // Insert items including one with zero quantity
    await db.insert(inventoryItemsTable)
      .values([
        {
          itemName: 'Out of Stock Item',
          quantity: 0
        },
        {
          itemName: 'In Stock Item',
          quantity: 100
        }
      ])
      .execute();

    const result = await getInventoryItems();

    expect(result).toHaveLength(2);
    
    const outOfStock = result.find(item => item.itemName === 'Out of Stock Item');
    expect(outOfStock?.quantity).toBe(0);
    
    const inStock = result.find(item => item.itemName === 'In Stock Item');
    expect(inStock?.quantity).toBe(100);
  });

  it('should return items with correct timestamp ordering', async () => {
    // Insert items with slight delay to test ordering
    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'First Item',
        quantity: 10
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(inventoryItemsTable)
      .values({
        itemName: 'Second Item',
        quantity: 20
      })
      .execute();

    const result = await getInventoryItems();

    expect(result).toHaveLength(2);
    
    // Both items should have valid timestamps
    result.forEach(item => {
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.updatedAt).toBeInstanceOf(Date);
      expect(item.createdAt.getTime()).toBeLessThanOrEqual(item.updatedAt.getTime());
    });
  });
});