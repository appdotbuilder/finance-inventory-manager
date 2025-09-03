import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { TransactionManager } from './components/TransactionManager';
import { InventoryManager } from './components/InventoryManager';
import { ReportingDashboard } from './components/ReportingDashboard';
import { Header } from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Dynamic Header */}
        <Header activeTab={activeTab} />

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              💳 Transactions
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              📦 Inventory
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 Reporting Dashboard
                </CardTitle>
                <CardDescription>
                  Comprehensive overview of your financial transactions and inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportingDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Transaction Management
                </CardTitle>
                <CardDescription>
                  Add, edit, and manage customer transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📦 Inventory Management
                </CardTitle>
                <CardDescription>
                  Add, edit, and manage inventory items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;