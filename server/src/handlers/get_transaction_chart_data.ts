import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type TransactionChartData } from '../schema';
import { sql } from 'drizzle-orm';

export const getTransactionChartData = async (): Promise<TransactionChartData[]> => {
  try {
    // Aggregate loan amounts by customer name for chart visualization
    // This provides total loan amount per customer for bar chart display
    const results = await db.select({
      customerName: transactionsTable.customerName,
      loanAmount: sql<string>`SUM(${transactionsTable.loanAmount})`.as('total_loan_amount')
    })
    .from(transactionsTable)
    .groupBy(transactionsTable.customerName)
    .orderBy(transactionsTable.customerName)
    .execute();

    // Convert numeric fields back to numbers for the response
    return results.map(result => ({
      customerName: result.customerName,
      loanAmount: parseFloat(result.loanAmount) // Convert aggregated sum back to number
    }));
  } catch (error) {
    console.error('Failed to fetch transaction chart data:', error);
    throw error;
  }
};