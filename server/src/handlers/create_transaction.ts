import { db } from '../db';
import { transactionsTable } from '../db/schema';
import { type CreateTransactionInput, type Transaction } from '../schema';

export const createTransaction = async (input: CreateTransactionInput): Promise<Transaction> => {
  try {
    // Insert transaction record
    const result = await db.insert(transactionsTable)
      .values({
        customerName: input.customerName,
        loanAmount: input.loanAmount.toString(), // Convert number to string for numeric column
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const transaction = result[0];
    return {
      ...transaction,
      loanAmount: parseFloat(transaction.loanAmount) // Convert string back to number
    };
  } catch (error) {
    console.error('Transaction creation failed:', error);
    throw error;
  }
};