import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type DeleteTransactionInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteTransaction = async (input: DeleteTransactionInput): Promise<{ success: boolean }> => {
  try {
    // Delete transaction record by ID
    const result = await db.delete(transactionsTable)
      .where(eq(transactionsTable.id, input.id))
      .execute();

    // Check if any rows were affected (transaction existed)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Transaction deletion failed:', error);
    throw error;
  }
};