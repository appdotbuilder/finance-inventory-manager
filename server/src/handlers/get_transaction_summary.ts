import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type TransactionSummary } from '../schema';
import { count, countDistinct, sum } from 'drizzle-orm';

export const getTransactionSummary = async (): Promise<TransactionSummary> => {
  try {
    // Execute the summary query with aggregations
    const result = await db
      .select({
        totalCustomers: countDistinct(transactionsTable.customerName),
        totalTransactions: count(transactionsTable.id),
        totalLoanAmount: sum(transactionsTable.loanAmount)
      })
      .from(transactionsTable)
      .execute();

    const summary = result[0];
    
    return {
      totalCustomers: summary.totalCustomers || 0,
      totalTransactions: summary.totalTransactions || 0,
      totalLoanAmount: parseFloat(summary.totalLoanAmount || '0') // Convert numeric to number
    };
  } catch (error) {
    console.error('Transaction summary calculation failed:', error);
    throw error;
  }
};