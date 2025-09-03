import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../../../server/src/schema';

export function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form state for creating new transactions
  const [formData, setFormData] = useState<CreateTransactionInput>({
    customerName: '',
    loanAmount: 0
  });

  // Form state for editing transactions
  const [editFormData, setEditFormData] = useState<Omit<UpdateTransactionInput, 'id'>>({
    customerName: '',
    loanAmount: 0
  });

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      const result = await trpc.getTransactions.query();
      setTransactions(result);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Show user-friendly message about stub implementation
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Create transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || formData.loanAmount <= 0) {
      alert('Please provide valid customer name and loan amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await trpc.createTransaction.mutate(formData);
      setTransactions((prev: Transaction[]) => [...prev, response]);
      // Reset form
      setFormData({
        customerName: '',
        loanAmount: 0
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update transaction
  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setIsLoading(true);
    try {
      const updateData: UpdateTransactionInput = {
        id: editingTransaction.id,
        ...(editFormData.customerName && { customerName: editFormData.customerName }),
        ...(editFormData.loanAmount && { loanAmount: editFormData.loanAmount })
      };
      
      const response = await trpc.updateTransaction.mutate(updateData);
      setTransactions((prev: Transaction[]) => 
        prev.map((t: Transaction) => t.id === editingTransaction.id ? response : t)
      );
      
      // Reset editing state
      setEditingTransaction(null);
      setEditFormData({ customerName: '', loanAmount: 0 });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert('Failed to update transaction. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteTransaction.mutate({ id });
      setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a transaction
  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      customerName: transaction.customerName,
      loanAmount: transaction.loanAmount
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTransaction(null);
    setEditFormData({ customerName: '', loanAmount: 0 });
  };

  return (
    <div className="space-y-8">
      {/* Create Transaction Form */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ➕ Add New Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Customer Name (Nasabah)"
              value={formData.customerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateTransactionInput) => ({ ...prev, customerName: e.target.value }))
              }
              required
            />
            <Input
              type="number"
              placeholder="Loan Amount (Pinjaman)"
              value={formData.loanAmount || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateTransactionInput) => ({ 
                  ...prev, 
                  loanAmount: parseFloat(e.target.value) || 0 
                }))
              }
              step="0.01"
              min="0.01"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? '💫 Creating...' : '💰 Create Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Transaction Form */}
      {editingTransaction && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✏️ Edit Transaction #{editingTransaction.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Customer Name"
                value={editFormData.customerName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ ...prev, customerName: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="Loan Amount"
                value={editFormData.loanAmount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ 
                    ...prev, 
                    loanAmount: parseFloat(e.target.value) || 0 
                  }))
                }
                step="0.01"
                min="0.01"
              />
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? '💫 Updating...' : '💾 Update'}
              </Button>
              <Button type="button" onClick={cancelEditing} variant="outline">
                ❌ Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 All Transactions
            <Badge variant="secondary">{transactions.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">💳 No transactions yet</p>
              <p className="text-sm">
                {/* Stub implementation notice */}
                Note: Backend is using stub implementation. Create a transaction above to see it here!
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Customer Name</TableHead>
                    <TableHead className="font-semibold">Loan Amount</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{transaction.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          👤 {transaction.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          💰 ${transaction.loanAmount.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        📅 {transaction.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        🔄 {transaction.updatedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(transaction)}
                            disabled={isLoading}
                          >
                            ✏️ Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={isLoading}>
                                🗑️ Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the transaction for{' '}
                                  <strong>{transaction.customerName}</strong> with amount{' '}
                                  <strong>${transaction.loanAmount.toFixed(2)}</strong>?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}