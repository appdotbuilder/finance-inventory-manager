import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { getTransactionChartData } from '../handlers/get_transaction_chart_data';
import { type CreateTransactionInput } from '../schema';

const testTransactions: CreateTransactionInput[] = [
  { customerName: 'John Doe', loanAmount: 1000.50 },
  { customerName: 'Jane Smith', loanAmount: 2500.75 },
  { customerName: 'John Doe', loanAmount: 1500.25 }, // Same customer, different loan
  { customerName: 'Alice Johnson', loanAmount: 3200.00 },
  { customerName: 'Jane Smith', loanAmount: 750.50 } // Same customer, different loan
];

describe('getTransactionChartData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no transactions exist', async () => {
    const result = await getTransactionChartData();

    expect(result).toEqual([]);
  });

  it('should return chart data for single transaction', async () => {
    // Insert single transaction
    await db.insert(transactionsTable)
      .values({
        customerName: testTransactions[0].customerName,
        loanAmount: testTransactions[0].loanAmount.toString()
      })
      .execute();

    const result = await getTransactionChartData();

    expect(result).toHaveLength(1);
    expect(result[0].customerName).toEqual('John Doe');
    expect(result[0].loanAmount).toEqual(1000.50);
    expect(typeof result[0].loanAmount).toBe('number');
  });

  it('should aggregate loan amounts by customer', async () => {
    // Insert all test transactions
    await db.insert(transactionsTable)
      .values(testTransactions.map(t => ({
        customerName: t.customerName,
        loanAmount: t.loanAmount.toString()
      })))
      .execute();

    const result = await getTransactionChartData();

    expect(result).toHaveLength(3); // 3 unique customers

    // Find results by customer name
    const johnDoe = result.find(r => r.customerName === 'John Doe');
    const janeSmith = result.find(r => r.customerName === 'Jane Smith');
    const aliceJohnson = result.find(r => r.customerName === 'Alice Johnson');

    // Verify aggregated amounts
    expect(johnDoe).toBeDefined();
    expect(johnDoe!.loanAmount).toEqual(2500.75); // 1000.50 + 1500.25
    expect(typeof johnDoe!.loanAmount).toBe('number');

    expect(janeSmith).toBeDefined();
    expect(janeSmith!.loanAmount).toEqual(3251.25); // 2500.75 + 750.50
    expect(typeof janeSmith!.loanAmount).toBe('number');

    expect(aliceJohnson).toBeDefined();
    expect(aliceJohnson!.loanAmount).toEqual(3200.00);
    expect(typeof aliceJohnson!.loanAmount).toBe('number');
  });

  it('should return results ordered by customer name', async () => {
    // Insert transactions in random order
    await db.insert(transactionsTable)
      .values([
        { customerName: 'Zebra Customer', loanAmount: '500.00' },
        { customerName: 'Alpha Customer', loanAmount: '1000.00' },
        { customerName: 'Beta Customer', loanAmount: '1500.00' }
      ])
      .execute();

    const result = await getTransactionChartData();

    expect(result).toHaveLength(3);
    expect(result[0].customerName).toEqual('Alpha Customer');
    expect(result[1].customerName).toEqual('Beta Customer');
    expect(result[2].customerName).toEqual('Zebra Customer');
  });

  it('should handle decimal precision correctly', async () => {
    // Insert transactions with various decimal places
    await db.insert(transactionsTable)
      .values([
        { customerName: 'Test Customer', loanAmount: '123.45' },
        { customerName: 'Test Customer', loanAmount: '67.89' }, // Properly formatted decimal
        { customerName: 'Test Customer', loanAmount: '100.00' }
      ])
      .execute();

    const result = await getTransactionChartData();

    expect(result).toHaveLength(1);
    expect(result[0].customerName).toEqual('Test Customer');
    // Sum: 123.45 + 67.89 + 100.00 = 291.34 (PostgreSQL numeric rounds to 2 decimal places)
    expect(result[0].loanAmount).toEqual(291.34);
    expect(typeof result[0].loanAmount).toBe('number');
  });

  it('should handle large loan amounts correctly', async () => {
    // Test with larger amounts
    await db.insert(transactionsTable)
      .values([
        { customerName: 'Big Loan Customer', loanAmount: '999999.99' },
        { customerName: 'Big Loan Customer', loanAmount: '1000000.01' }
      ])
      .execute();

    const result = await getTransactionChartData();

    expect(result).toHaveLength(1);
    expect(result[0].customerName).toEqual('Big Loan Customer');
    expect(result[0].loanAmount).toEqual(2000000.00); // 999999.99 + 1000000.01
    expect(typeof result[0].loanAmount).toBe('number');
  });
});