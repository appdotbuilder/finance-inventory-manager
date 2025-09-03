import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateTransactionInput, type CreateTransactionInput } from '../schema';
import { updateTransaction } from '../handlers/update_transaction';

// Helper function to create a test transaction
const createTestTransaction = async (data: CreateTransactionInput) => {
  const result = await db.insert(transactionsTable)
    .values({
      customerName: data.customerName,
      loanAmount: data.loanAmount.toString()
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    loanAmount: parseFloat(result[0].loanAmount)
  };
};

describe('updateTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update transaction customer name only', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 5000
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id,
      customerName: 'Jane Smith'
    };

    const result = await updateTransaction(updateInput);

    // Verify updated fields
    expect(result.id).toBe(initialTransaction.id);
    expect(result.customerName).toBe('Jane Smith');
    expect(result.loanAmount).toBe(5000); // Should remain unchanged
    expect(result.createdAt).toEqual(initialTransaction.createdAt);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThan(initialTransaction.updatedAt.getTime());
  });

  it('should update transaction loan amount only', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 5000
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id,
      loanAmount: 7500.50
    };

    const result = await updateTransaction(updateInput);

    // Verify updated fields
    expect(result.id).toBe(initialTransaction.id);
    expect(result.customerName).toBe('John Doe'); // Should remain unchanged
    expect(result.loanAmount).toBe(7500.50);
    expect(typeof result.loanAmount).toBe('number');
    expect(result.createdAt).toEqual(initialTransaction.createdAt);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThan(initialTransaction.updatedAt.getTime());
  });

  it('should update both customer name and loan amount', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 5000
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id,
      customerName: 'Jane Smith',
      loanAmount: 12000.75
    };

    const result = await updateTransaction(updateInput);

    // Verify all updated fields
    expect(result.id).toBe(initialTransaction.id);
    expect(result.customerName).toBe('Jane Smith');
    expect(result.loanAmount).toBe(12000.75);
    expect(typeof result.loanAmount).toBe('number');
    expect(result.createdAt).toEqual(initialTransaction.createdAt);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThan(initialTransaction.updatedAt.getTime());
  });

  it('should save updated transaction to database', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 5000
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id,
      customerName: 'Updated Name',
      loanAmount: 9999.99
    };

    await updateTransaction(updateInput);

    // Verify transaction was updated in database
    const updatedTransactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, initialTransaction.id))
      .execute();

    expect(updatedTransactions).toHaveLength(1);
    const dbTransaction = updatedTransactions[0];
    expect(dbTransaction.customerName).toBe('Updated Name');
    expect(parseFloat(dbTransaction.loanAmount)).toBe(9999.99);
    expect(dbTransaction.updatedAt).toBeInstanceOf(Date);
    expect(dbTransaction.updatedAt.getTime()).toBeGreaterThan(initialTransaction.updatedAt.getTime());
  });

  it('should update only updatedAt when no fields provided', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 5000
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id
    };

    const result = await updateTransaction(updateInput);

    // Verify only updatedAt changed
    expect(result.id).toBe(initialTransaction.id);
    expect(result.customerName).toBe(initialTransaction.customerName);
    expect(result.loanAmount).toBe(initialTransaction.loanAmount);
    expect(result.createdAt).toEqual(initialTransaction.createdAt);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt.getTime()).toBeGreaterThan(initialTransaction.updatedAt.getTime());
  });

  it('should throw error when transaction does not exist', async () => {
    const updateInput: UpdateTransactionInput = {
      id: 99999, // Non-existent ID
      customerName: 'Test Customer'
    };

    await expect(updateTransaction(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle decimal loan amounts correctly', async () => {
    // Create initial transaction
    const initialTransaction = await createTestTransaction({
      customerName: 'John Doe',
      loanAmount: 1000.00
    });

    const updateInput: UpdateTransactionInput = {
      id: initialTransaction.id,
      loanAmount: 2500.33
    };

    const result = await updateTransaction(updateInput);

    // Verify numeric precision handling
    expect(result.loanAmount).toBe(2500.33);
    expect(typeof result.loanAmount).toBe('number');

    // Verify database storage
    const dbTransactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, initialTransaction.id))
      .execute();

    expect(parseFloat(dbTransactions[0].loanAmount)).toBe(2500.33);
  });
});