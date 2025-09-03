import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { StatsCard } from './StatsCard';
// Note: Recharts would be used here for charts, but since package.json can't be modified,
// we'll create simple visual representations using CSS and HTML
import type { 
  Transaction, 
  InventoryItem, 
  TransactionSummary, 
  InventorySummary, 
  TransactionChartData, 
  InventoryChartData 
} from '../../../server/src/schema';

export function ReportingDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary>({
    totalCustomers: 0,
    totalTransactions: 0,
    totalLoanAmount: 0
  });
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
    totalItemTypes: 0,
    totalStockQuantity: 0
  });
  const [transactionChartData, setTransactionChartData] = useState<TransactionChartData[]>([]);
  const [inventoryChartData, setInventoryChartData] = useState<InventoryChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load all data concurrently
      const [
        transactionsResult,
        inventoryResult,
        transactionSummaryResult,
        inventorySummaryResult,
        transactionChartResult,
        inventoryChartResult
      ] = await Promise.all([
        trpc.getTransactions.query(),
        trpc.getInventoryItems.query(),
        trpc.getTransactionSummary.query(),
        trpc.getInventorySummary.query(),
        trpc.getTransactionChartData.query(),
        trpc.getInventoryChartData.query()
      ]);

      setTransactions(transactionsResult);
      setInventoryItems(inventoryResult);
      setTransactionSummary(transactionSummaryResult);
      setInventorySummary(inventorySummaryResult);
      setTransactionChartData(transactionChartResult);
      setInventoryChartData(inventoryChartResult);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Color schemes for visual elements
  const inventoryPieColors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

  // Loading state
  if (isLoading) {
    return <LoadingSpinner message="📊 Loading dashboard data..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Customers"
          value={transactionSummary.totalCustomers}
          description="Unique customers"
          icon="👥"
          gradient="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          textColor="text-blue-600"
        />
        <StatsCard
          title="Total Transactions"
          value={transactionSummary.totalTransactions}
          description="All transactions"
          icon="💳"
          gradient="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          textColor="text-green-600"
        />
        <StatsCard
          title="Total Loan Amount"
          value={transactionSummary.totalLoanAmount}
          description="Total loans issued"
          icon="💰"
          gradient="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
          textColor="text-yellow-600"
        />
        <StatsCard
          title="Item Types"
          value={inventorySummary.totalItemTypes}
          description="Different items"
          icon="📦"
          gradient="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          textColor="text-purple-600"
        />
        <StatsCard
          title="Total Stock"
          value={inventorySummary.totalStockQuantity}
          description="Units in stock"
          icon="📊"
          gradient="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
          textColor="text-indigo-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Loan Amount by Customer
            </CardTitle>
            <CardDescription>
              Visual representation of loan amounts per customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>📈 No transaction data available</p>
                <p className="text-sm mt-1">
                  Note: Backend using stub implementation
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 To see charts: Install recharts package: <code className="bg-white px-1 rounded">npm install recharts</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactionChartData.map((data: TransactionChartData, index: number) => {
                  const maxAmount = Math.max(...transactionChartData.map(d => d.loanAmount));
                  const widthPercentage = (data.loanAmount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">👤 {data.customerName}</span>
                        <span className="text-green-600">${data.loanAmount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full chart-bar"
                          style={{ width: `${widthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🥧 Inventory Distribution
            </CardTitle>
            <CardDescription>
              Stock quantity distribution across items
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>📦 No inventory data available</p>
                <p className="text-sm mt-1">
                  Note: Backend using stub implementation
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600">
                    💡 To see charts: Install recharts package: <code className="bg-white px-1 rounded">npm install recharts</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inventoryChartData.map((data: InventoryChartData, index: number) => {
                  const totalQuantity = inventoryChartData.reduce((sum, item) => sum + item.quantity, 0);
                  const percentage = ((data.quantity / totalQuantity) * 100).toFixed(1);
                  const color = inventoryPieColors[index % inventoryPieColors.length];
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-medium">📦 {data.itemName}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{data.quantity} units</span>
                          <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Recent Transactions
              <Badge variant="secondary">{transactions.length} records</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>💳 No transactions found</p>
                <p className="text-sm mt-1">
                  Note: Backend using stub implementation. 
                  Go to Transactions tab to create some!
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction: Transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell>👤 {transaction.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            💰 ${transaction.loanAmount.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          📅 {transaction.createdAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📦 Inventory Overview
              <Badge variant="secondary">{inventoryItems.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>📦 No inventory items found</p>
                <p className="text-sm mt-1">
                  Note: Backend using stub implementation. 
                  Go to Inventory tab to create some!
                </p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Item Name</TableHead>
                      <TableHead className="font-semibold">Quantity</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.slice(0, 10).map((item: InventoryItem) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>📦 {item.itemName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            📊 {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            item.quantity === 0 ? 'bg-red-100 text-red-800 border-red-300' :
                            item.quantity < 10 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }>
                            {item.quantity === 0 ? '🚫 Out' : 
                             item.quantity < 10 ? '⚠️ Low' : '✅ Good'}
                          </Badge>
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

      {/* Footer Note */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              💡 <strong>Note:</strong> This dashboard is currently using backend stub implementations.
            </p>
            <p>
              Real data will appear here once the backend handlers are implemented with actual database operations.
              You can still test the frontend functionality by creating transactions and inventory items!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}