import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  activeTab: string;
}

export function Header({ activeTab }: HeaderProps) {
  const getTabInfo = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: '📊 Financial Dashboard',
          description: 'Comprehensive overview of transactions and inventory',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case 'transactions':
        return {
          title: '💳 Transaction Management',
          description: 'Manage customer loans and financial transactions',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      case 'inventory':
        return {
          title: '📦 Inventory Management',
          description: 'Track and manage your inventory items',
          color: 'bg-purple-50 border-purple-200 text-purple-800'
        };
      default:
        return {
          title: '💰 Financial Management System',
          description: 'Manage your business operations',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  const tabInfo = getTabInfo(activeTab);

  return (
    <Card className={`mb-8 ${tabInfo.color} border-2`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{tabInfo.title}</h1>
          <p className="text-sm opacity-80 mb-3">{tabInfo.description}</p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="bg-white/50">
              🔗 tRPC Powered
            </Badge>
            <Badge variant="secondary" className="bg-white/50">
              ⚡ TypeScript
            </Badge>
            <Badge variant="secondary" className="bg-white/50">
              🎨 Radix UI
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}