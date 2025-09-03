import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type CreateTransactionInput } from '../schema';
import { createTransaction } from '../handlers/create_transaction';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateTransactionInput = {
  customerName: 'John Doe',
  loanAmount: 15000.50
};

describe('createTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a transaction', async () => {
    const result = await createTransaction(testInput);

    // Basic field validation
    expect(result.customerName).toEqual('John Doe');
    expect(result.loanAmount).toEqual(15000.50);
    expect(typeof result.loanAmount).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should save transaction to database', async () => {
    const result = await createTransaction(testInput);

    // Query using proper drizzle syntax
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].customerName).toEqual('John Doe');
    expect(parseFloat(transactions[0].loanAmount)).toEqual(15000.50);
    expect(transactions[0].createdAt).toBeInstanceOf(Date);
    expect(transactions[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should handle different customer names and loan amounts', async () => {
    const testCases: CreateTransactionInput[] = [
      { customerName: 'Alice Smith', loanAmount: 5000.25 },
      { customerName: 'Bob Johnson', loanAmount: 25000.00 },
      { customerName: 'Maria Garcia', loanAmount: 1500.75 }
    ];

    const results = await Promise.all(
      testCases.map(testCase => createTransaction(testCase))
    );

    // Verify all transactions were created
    expect(results).toHaveLength(3);
    
    // Check each result
    results.forEach((result, index) => {
      expect(result.customerName).toEqual(testCases[index].customerName);
      expect(result.loanAmount).toEqual(testCases[index].loanAmount);
      expect(typeof result.loanAmount).toBe('number');
      expect(result.id).toBeDefined();
    });

    // Verify all are in database
    const dbTransactions = await db.select()
      .from(transactionsTable)
      .execute();

    expect(dbTransactions).toHaveLength(3);
  });

  it('should query transactions by date range correctly', async () => {
    // Create test transaction
    await createTransaction(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building - step by step
    const transactions = await db.select()
      .from(transactionsTable)
      .where(
        and(
          gte(transactionsTable.createdAt, yesterday),
          between(transactionsTable.createdAt, yesterday, tomorrow)
        )
      )
      .execute();

    expect(transactions.length).toBeGreaterThan(0);
    transactions.forEach(transaction => {
      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.createdAt >= yesterday).toBe(true);
      expect(transaction.createdAt <= tomorrow).toBe(true);
    });
  });

  it('should handle decimal precision correctly', async () => {
    const precisionInput: CreateTransactionInput = {
      customerName: 'Precision Test',
      loanAmount: 12345.67
    };

    const result = await createTransaction(precisionInput);

    // Verify decimal precision is maintained
    expect(result.loanAmount).toEqual(12345.67);
    expect(typeof result.loanAmount).toBe('number');

    // Verify in database
    const dbTransaction = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, result.id))
      .execute();

    expect(parseFloat(dbTransaction[0].loanAmount)).toEqual(12345.67);
  });

  it('should create transactions with minimum valid values', async () => {
    const minimalInput: CreateTransactionInput = {
      customerName: 'A', // Minimum valid name (1 character)
      loanAmount: 0.01 // Minimum positive amount
    };

    const result = await createTransaction(minimalInput);

    expect(result.customerName).toEqual('A');
    expect(result.loanAmount).toEqual(0.01);
    expect(result.id).toBeDefined();
  });
});