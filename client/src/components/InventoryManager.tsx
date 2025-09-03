import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { InventoryItem, CreateInventoryItemInput, UpdateInventoryItemInput } from '../../../server/src/schema';

export function InventoryManager() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state for creating new inventory items
  const [formData, setFormData] = useState<CreateInventoryItemInput>({
    itemName: '',
    quantity: 0
  });

  // Form state for editing inventory items
  const [editFormData, setEditFormData] = useState<Omit<UpdateInventoryItemInput, 'id'>>({
    itemName: '',
    quantity: 0
  });

  // Load inventory items
  const loadInventoryItems = useCallback(async () => {
    try {
      const result = await trpc.getInventoryItems.query();
      setInventoryItems(result);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      // Show user-friendly message about stub implementation
    }
  }, []);

  useEffect(() => {
    loadInventoryItems();
  }, [loadInventoryItems]);

  // Create inventory item
  const handleCreateInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim() || formData.quantity < 0) {
      alert('Please provide valid item name and quantity');
      return;
    }

    setIsLoading(true);
    try {
      const response = await trpc.createInventoryItem.mutate(formData);
      setInventoryItems((prev: InventoryItem[]) => [...prev, response]);
      // Reset form
      setFormData({
        itemName: '',
        quantity: 0
      });
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      alert('Failed to create inventory item. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update inventory item
  const handleUpdateInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    try {
      const updateData: UpdateInventoryItemInput = {
        id: editingItem.id,
        ...(editFormData.itemName && { itemName: editFormData.itemName }),
        ...(editFormData.quantity !== undefined && { quantity: editFormData.quantity })
      };
      
      const response = await trpc.updateInventoryItem.mutate(updateData);
      setInventoryItems((prev: InventoryItem[]) => 
        prev.map((item: InventoryItem) => item.id === editingItem.id ? response : item)
      );
      
      // Reset editing state
      setEditingItem(null);
      setEditFormData({ itemName: '', quantity: 0 });
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      alert('Failed to update inventory item. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete inventory item
  const handleDeleteInventoryItem = async (id: number) => {
    setIsLoading(true);
    try {
      await trpc.deleteInventoryItem.mutate({ id });
      setInventoryItems((prev: InventoryItem[]) => prev.filter((item: InventoryItem) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      alert('Failed to delete inventory item. This might be due to backend stub implementation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing an inventory item
  const startEditing = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData({
      itemName: item.itemName,
      quantity: item.quantity
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditFormData({ itemName: '', quantity: 0 });
  };

  // Get stock status color
  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800 border-red-300';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="space-y-8">
      {/* Create Inventory Item Form */}
      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ➕ Add New Inventory Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInventoryItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Item Name (Nama)"
              value={formData.itemName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateInventoryItemInput) => ({ ...prev, itemName: e.target.value }))
              }
              required
            />
            <Input
              type="number"
              placeholder="Quantity (Jumlah)"
              value={formData.quantity || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateInventoryItemInput) => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 0 
                }))
              }
              min="0"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? '💫 Creating...' : '📦 Add Item'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Edit Inventory Item Form */}
      {editingItem && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✏️ Edit Item #{editingItem.id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateInventoryItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Item Name"
                value={editFormData.itemName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ ...prev, itemName: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={editFormData.quantity || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 0 
                  }))
                }
                min="0"
              />
              <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
                {isLoading ? '💫 Updating...' : '💾 Update'}
              </Button>
              <Button type="button" onClick={cancelEditing} variant="outline">
                ❌ Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 All Inventory Items
            <Badge variant="secondary">{inventoryItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📦 No inventory items yet</p>
              <p className="text-sm">
                {/* Stub implementation notice */}
                Note: Backend is using stub implementation. Add an item above to see it here!
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Item Name</TableHead>
                    <TableHead className="font-semibold">Quantity</TableHead>
                    <TableHead className="font-semibold">Stock Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Updated</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item: InventoryItem) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          📦 {item.itemName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          📊 {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStockStatusColor(item.quantity)}>
                          {item.quantity === 0 ? '🚫 Out of Stock' : 
                           item.quantity < 10 ? '⚠️ Low Stock' : '✅ In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        📅 {item.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        🔄 {item.updatedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item)}
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
                                <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{' '}
                                  <strong>{item.itemName}</strong> with quantity{' '}
                                  <strong>{item.quantity}</strong>?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInventoryItem(item.id)}
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