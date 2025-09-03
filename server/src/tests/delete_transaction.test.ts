import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type DeleteTransactionInput, type CreateTransactionInput } from '../schema';
import { deleteTransaction } from '../handlers/delete_transaction';
import { eq } from 'drizzle-orm';

// Test inputs
const testTransaction: CreateTransactionInput = {
  customerName: 'John Doe',
  loanAmount: 5000.00
};

const createTestTransaction = async () => {
  const result = await db.insert(transactionsTable)
    .values({
      customerName: testTransaction.customerName,
      loanAmount: testTransaction.loanAmount.toString()
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('deleteTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete existing transaction successfully', async () => {
    // Create test transaction first
    const createdTransaction = await createTestTransaction();
    
    const deleteInput: DeleteTransactionInput = {
      id: createdTransaction.id
    };

    const result = await deleteTransaction(deleteInput);

    expect(result.success).toBe(true);

    // Verify transaction was actually deleted from database
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, createdTransaction.id))
      .execute();

    expect(transactions).toHaveLength(0);
  });

  it('should return false for non-existent transaction', async () => {
    const deleteInput: DeleteTransactionInput = {
      id: 99999 // Non-existent ID
    };

    const result = await deleteTransaction(deleteInput);

    expect(result.success).toBe(false);
  });

  it('should not affect other transactions when deleting one', async () => {
    // Create multiple test transactions
    const transaction1 = await createTestTransaction();
    const transaction2 = await db.insert(transactionsTable)
      .values({
        customerName: 'Jane Smith',
        loanAmount: '3000.50'
      })
      .returning()
      .execute();

    const deleteInput: DeleteTransactionInput = {
      id: transaction1.id
    };

    const result = await deleteTransaction(deleteInput);

    expect(result.success).toBe(true);

    // Verify only target transaction was deleted
    const remainingTransactions = await db.select()
      .from(transactionsTable)
      .execute();

    expect(remainingTransactions).toHaveLength(1);
    expect(remainingTransactions[0].id).toBe(transaction2[0].id);
    expect(remainingTransactions[0].customerName).toBe('Jane Smith');
  });

  it('should handle multiple deletions correctly', async () => {
    // Create test transactions
    const transaction1 = await createTestTransaction();
    const transaction2 = await db.insert(transactionsTable)
      .values({
        customerName: 'Bob Wilson',
        loanAmount: '7500.25'
      })
      .returning()
      .execute();

    // Delete first transaction
    const deleteInput1: DeleteTransactionInput = {
      id: transaction1.id
    };
    const result1 = await deleteTransaction(deleteInput1);
    expect(result1.success).toBe(true);

    // Delete second transaction
    const deleteInput2: DeleteTransactionInput = {
      id: transaction2[0].id
    };
    const result2 = await deleteTransaction(deleteInput2);
    expect(result2.success).toBe(true);

    // Verify both transactions are deleted
    const remainingTransactions = await db.select()
      .from(transactionsTable)
      .execute();

    expect(remainingTransactions).toHaveLength(0);
  });

  it('should handle attempting to delete already deleted transaction', async () => {
    // Create and delete transaction
    const transaction = await createTestTransaction();
    
    const deleteInput: DeleteTransactionInput = {
      id: transaction.id
    };

    // First deletion should succeed
    const firstResult = await deleteTransaction(deleteInput);
    expect(firstResult.success).toBe(true);

    // Second deletion attempt should return false
    const secondResult = await deleteTransaction(deleteInput);
    expect(secondResult.success).toBe(false);
  });
});