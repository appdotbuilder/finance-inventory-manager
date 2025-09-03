import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type Transaction } from '../schema';
import { desc } from 'drizzle-orm';

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    // Select all transactions ordered by most recent first
    const results = await db.select()
      .from(transactionsTable)
      .orderBy(desc(transactionsTable.createdAt))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(transaction => ({
      ...transaction,
      loanAmount: parseFloat(transaction.loanAmount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};