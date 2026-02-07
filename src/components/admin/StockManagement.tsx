import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useStock } from '@/hooks/useStock';
import { toast } from 'sonner';
import type { StockItem } from '@/types';

export default function StockManagement() {
  const { 
    stock, 
    alerts, 
    updateStock, 
    restockItem, 
    clearAllAlerts,
    getLowStockItems,
    getOutOfStockItems 
  } = useStock();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);

  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'low') return matchesSearch && item.quantity > 0 && item.quantity < item.minThreshold;
    if (filter === 'out') return matchesSearch && item.quantity === 0;
    return matchesSearch;
  });

  const handleRestock = () => {
    if (selectedItem && restockAmount > 0) {
      restockItem(selectedItem.id, restockAmount);
      toast.success(`${selectedItem.name} restocked by ${restockAmount} ${selectedItem.unit}`);
      setIsRestockDialogOpen(false);
      setSelectedItem(null);
      setRestockAmount(10);
    }
  };

  const openRestockDialog = (item: StockItem) => {
    setSelectedItem(item);
    setRestockAmount(Math.min(10, item.maxThreshold - item.quantity));
    setIsRestockDialogOpen(true);
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-500' };
    if (item.quantity < item.minThreshold) return { label: 'Low Stock', color: 'bg-orange-500' };
    return { label: 'In Stock', color: 'bg-green-500' };
  };

  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Stock Alerts ({alerts.filter(a => !a.isRead).length})
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllAlerts}
              className="text-red-700 hover:text-red-800"
            >
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(a => !a.isRead).slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    {alert.alertType === 'out' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium text-[#13120f]">{alert.itemName}</p>
                      <p className="text-sm text-[#5d5d5d]">
                        {alert.alertType === 'out' 
                          ? 'Out of stock' 
                          : `Low stock: ${alert.currentStock} remaining (min: ${alert.minThreshold})`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const item = stock.find(s => s.id === alert.itemId);
                      if (item) openRestockDialog(item);
                    }}
                    className="bg-[#e39a22] text-[#13120f]"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-[#e39a22]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d5d5d]">Total Items</p>
                <p className="text-2xl font-bold text-[#13120f]">{stock.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#e39a22]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d5d5d]">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#e39a22]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5d5d5d]">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card className="bg-white border-[#e39a22]/20">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg text-[#13120f]">Inventory</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d5d5d]" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 bg-[#fbf5dc] border-[#e39a22]/30"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 rounded-md border border-[#e39a22]/30 bg-[#fbf5dc] text-sm"
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e39a22]/20">
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Item</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Category</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Stock</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => {
                  const status = getStockStatus(item);
                  const stockPercentage = (item.quantity / item.maxThreshold) * 100;
                  
                  return (
                    <tr key={item.id} className="border-b border-[#e9e9e9] hover:bg-[#fbf5dc]/50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-[#13120f]">{item.name}</p>
                          <p className="text-xs text-[#5d5d5d]">{item.supplier}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary" className="bg-[#e39a22]/10 text-[#e39a22]">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={item.quantity < item.minThreshold ? 'text-red-600 font-semibold' : 'text-[#13120f]'}>
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-[#5d5d5d]">/ {item.maxThreshold}</span>
                          </div>
                          <div className="h-2 bg-[#e9e9e9] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                stockPercentage < 25 ? 'bg-red-500' : 
                                stockPercentage < 50 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, stockPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRestockDialog(item)}
                            className="border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Restock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              updateStock(item.id, Math.max(0, item.quantity - 1));
                            }}
                            className="border-red-300 text-red-500 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredStock.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-[#e39a22]/50 mb-3" />
              <p className="text-[#5d5d5d]">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="bg-[#fbf5dc] border-[#e39a22]/30">
          <DialogHeader>
            <DialogTitle className="text-[#13120f]">Restock {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-[#13120f]">Current Stock</Label>
              <p className="text-2xl font-bold text-[#e39a22]">
                {selectedItem?.quantity} {selectedItem?.unit}
              </p>
            </div>
            <div>
              <Label htmlFor="restock-amount" className="text-[#13120f]">Amount to Add</Label>
              <Input
                id="restock-amount"
                type="number"
                min={1}
                max={selectedItem ? selectedItem.maxThreshold - selectedItem.quantity : 100}
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                className="bg-white border-[#e39a22]/30"
              />
              <p className="text-sm text-[#5d5d5d] mt-1">
                Max capacity: {selectedItem?.maxThreshold} {selectedItem?.unit}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRestockDialogOpen(false)}
              className="border-[#e39a22]/30"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRestock}
              disabled={restockAmount <= 0}
              className="bg-[#e39a22] text-[#13120f]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
