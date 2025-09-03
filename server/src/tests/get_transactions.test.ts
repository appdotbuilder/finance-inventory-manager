import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { getTransactions } from '../handlers/get_transactions';

describe('getTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no transactions exist', async () => {
    const result = await getTransactions();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all transactions with correct data types', async () => {
    // Create test transactions
    const testData = [
      {
        customerName: 'John Doe',
        loanAmount: '1500.50'
      },
      {
        customerName: 'Jane Smith',
        loanAmount: '2000.00'
      }
    ];

    await db.insert(transactionsTable)
      .values(testData)
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(2);
    
    // Verify data types and field conversions
    result.forEach(transaction => {
      expect(typeof transaction.id).toBe('number');
      expect(typeof transaction.customerName).toBe('string');
      expect(typeof transaction.loanAmount).toBe('number'); // Should be converted from string
      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    // Verify specific values
    const customerNames = result.map(t => t.customerName);
    expect(customerNames).toContain('John Doe');
    expect(customerNames).toContain('Jane Smith');
    
    const loanAmounts = result.map(t => t.loanAmount);
    expect(loanAmounts).toContain(1500.50);
    expect(loanAmounts).toContain(2000.00);
  });

  it('should return transactions ordered by creation date (newest first)', async () => {
    // Create transactions with slight delay to ensure different timestamps
    await db.insert(transactionsTable)
      .values({
        customerName: 'First Customer',
        loanAmount: '1000.00'
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(transactionsTable)
      .values({
        customerName: 'Second Customer',
        loanAmount: '2000.00'
      })
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(2);
    
    // Verify ordering - newest first
    expect(result[0].customerName).toBe('Second Customer');
    expect(result[1].customerName).toBe('First Customer');
    
    // Verify timestamps are in descending order
    expect(result[0].createdAt >= result[1].createdAt).toBe(true);
  });

  it('should handle large loan amounts correctly', async () => {
    const largeAmount = 999999.99;
    
    await db.insert(transactionsTable)
      .values({
        customerName: 'Big Loan Customer',
        loanAmount: largeAmount.toString()
      })
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(1);
    expect(result[0].loanAmount).toBe(largeAmount);
    expect(typeof result[0].loanAmount).toBe('number');
  });

  it('should handle decimal precision correctly', async () => {
    const preciseAmount = 123.45;
    
    await db.insert(transactionsTable)
      .values({
        customerName: 'Precise Amount Customer',
        loanAmount: preciseAmount.toString()
      })
      .execute();

    const result = await getTransactions();

    expect(result).toHaveLength(1);
    expect(result[0].loanAmount).toBe(preciseAmount);
    expect(typeof result[0].loanAmount).toBe('number');
  });

  it('should verify database persistence', async () => {
    // Insert transaction
    await db.insert(transactionsTable)
      .values({
        customerName: 'Persistent Customer',
        loanAmount: '500.25'
      })
      .execute();

    // Fetch via handler
    const handlerResult = await getTransactions();

    // Verify same data exists in database
    const dbResult = await db.select()
      .from(transactionsTable)
      .execute();

    expect(handlerResult).toHaveLength(1);
    expect(dbResult).toHaveLength(1);
    
    // Compare values
    expect(handlerResult[0].customerName).toBe(dbResult[0].customerName);
    expect(handlerResult[0].loanAmount).toBe(parseFloat(dbResult[0].loanAmount));
    expect(handlerResult[0].id).toBe(dbResult[0].id);
  });
});