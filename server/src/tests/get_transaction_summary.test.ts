import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { getTransactionSummary } from '../handlers/get_transaction_summary';

describe('getTransactionSummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero summary for empty database', async () => {
    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(0);
    expect(result.totalTransactions).toEqual(0);
    expect(result.totalLoanAmount).toEqual(0);
    expect(typeof result.totalLoanAmount).toEqual('number');
  });

  it('should calculate correct summary for single transaction', async () => {
    // Create test transaction
    await db.insert(transactionsTable)
      .values({
        customerName: 'John Doe',
        loanAmount: '1500.50'
      })
      .execute();

    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(1);
    expect(result.totalTransactions).toEqual(1);
    expect(result.totalLoanAmount).toEqual(1500.50);
    expect(typeof result.totalLoanAmount).toEqual('number');
  });

  it('should calculate correct summary for multiple transactions with same customer', async () => {
    // Create multiple transactions for same customer
    await db.insert(transactionsTable)
      .values([
        {
          customerName: 'Alice Smith',
          loanAmount: '1000.00'
        },
        {
          customerName: 'Alice Smith',
          loanAmount: '2500.75'
        }
      ])
      .execute();

    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(1); // Only one unique customer
    expect(result.totalTransactions).toEqual(2); // Two transactions
    expect(result.totalLoanAmount).toEqual(3500.75); // Sum of both amounts
    expect(typeof result.totalLoanAmount).toEqual('number');
  });

  it('should calculate correct summary for multiple transactions with different customers', async () => {
    // Create transactions for different customers
    await db.insert(transactionsTable)
      .values([
        {
          customerName: 'Bob Johnson',
          loanAmount: '500.25'
        },
        {
          customerName: 'Carol Williams',
          loanAmount: '750.00'
        },
        {
          customerName: 'David Brown',
          loanAmount: '1200.50'
        }
      ])
      .execute();

    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(3); // Three unique customers
    expect(result.totalTransactions).toEqual(3); // Three transactions
    expect(result.totalLoanAmount).toEqual(2450.75); // Sum of all amounts
    expect(typeof result.totalLoanAmount).toEqual('number');
  });

  it('should handle mixed scenario with duplicate and unique customers', async () => {
    // Create complex mix of transactions
    await db.insert(transactionsTable)
      .values([
        {
          customerName: 'Emma Davis',
          loanAmount: '800.00'
        },
        {
          customerName: 'Frank Miller',
          loanAmount: '1500.25'
        },
        {
          customerName: 'Emma Davis', // Duplicate customer
          loanAmount: '600.75'
        },
        {
          customerName: 'Grace Wilson',
          loanAmount: '2000.00'
        },
        {
          customerName: 'Frank Miller', // Another duplicate
          loanAmount: '300.50'
        }
      ])
      .execute();

    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(3); // Emma, Frank, Grace (unique)
    expect(result.totalTransactions).toEqual(5); // Five total transactions
    expect(result.totalLoanAmount).toEqual(5201.50); // Sum of all amounts
    expect(typeof result.totalLoanAmount).toEqual('number');
  });

  it('should handle decimal precision correctly', async () => {
    // Test with various decimal amounts
    await db.insert(transactionsTable)
      .values([
        {
          customerName: 'Test User 1',
          loanAmount: '999.99'
        },
        {
          customerName: 'Test User 2',
          loanAmount: '0.01'
        },
        {
          customerName: 'Test User 3',
          loanAmount: '1234.567' // More than 2 decimal places (will be truncated to 2)
        }
      ])
      .execute();

    const result = await getTransactionSummary();

    expect(result.totalCustomers).toEqual(3);
    expect(result.totalTransactions).toEqual(3);
    // Note: PostgreSQL numeric(10,2) will store 1234.567 as 1234.57
    expect(result.totalLoanAmount).toBeCloseTo(2234.57, 2);
    expect(typeof result.totalLoanAmount).toEqual('number');
  });
});