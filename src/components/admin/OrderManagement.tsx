import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ChefHat, 
  UtensilsCrossed,
  Clock,
  Package,
  Truck,
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-orange-500', icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-blue-500', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-purple-500', icon: CheckCircle },
  served: { label: 'Served', color: 'bg-indigo-500', icon: UtensilsCrossed },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const orderTypeIcons: Record<string, React.ElementType> = {
  'dine-in': UtensilsCrossed,
  'takeaway': Package,
  'delivery': Truck,
};

export default function OrderManagement() {
  const { orders, updateOrderStatus, updatePaymentStatus, cancelOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handlePaymentUpdate = (orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => {
    updatePaymentStatus(orderId, status);
    toast.success(`Payment status updated to ${status}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'completed'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < flow.length - 1) {
      return flow[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map(status => {
          const config = statusConfig[status];
          const count = orders.filter(o => o.status === status).length;
          return (
            <Card 
              key={status} 
              className={`bg-white border-[#e39a22]/20 cursor-pointer hover:border-[#e39a22] transition-colors ${
                statusFilter === status ? 'ring-2 ring-[#e39a22]' : ''
              }`}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#5d5d5d]">{config.label}</p>
                    <p className="text-2xl font-bold text-[#13120f]">{count}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${config.color} bg-opacity-20 flex items-center justify-center`}>
                    <config.icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card className="bg-white border-[#e39a22]/20">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg text-[#13120f]">
            All Orders 
            <Badge className="ml-2 bg-[#e39a22] text-[#13120f]">
              {filteredOrders.length}
            </Badge>
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5d5d5d]" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 bg-[#fbf5dc] border-[#e39a22]/30"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
              <SelectTrigger className="w-40 bg-[#fbf5dc] border-[#e39a22]/30">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e39a22]/20">
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Order ID</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Customer</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Type</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Items</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Total</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Payment</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusConfig_item = statusConfig[order.status];
                  const TypeIcon = orderTypeIcons[order.orderType];
                  
                  return (
                    <tr key={order.id} className="border-b border-[#e9e9e9] hover:bg-[#fbf5dc]/50">
                      <td className="py-3">
                        <span className="font-semibold text-[#13120f]">{order.id}</span>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-[#13120f]">{order.customerName}</p>
                          <p className="text-xs text-[#5d5d5d]">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-[#e39a22]" />
                          <span className="text-sm text-[#13120f] capitalize">{order.orderType}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-[#5d5d5d]">{order.items.length} items</span>
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-[#13120f]">${order.finalAmount.toFixed(2)}</span>
                      </td>
                      <td className="py-3">
                        <Badge className={`${statusConfig_item.color} text-white`}>
                          <statusConfig_item.icon className="w-3 h-3 mr-1" />
                          {statusConfig_item.label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className={order.paymentStatus === 'paid' ? 'bg-green-500' : ''}
                        >
                          <DollarSign className="w-3 h-3 mr-1" />
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOrderDetails(order)}
                            className="border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {getNextStatus(order.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                              className="bg-[#e39a22] text-[#13120f]"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-[#e39a22]/50 mb-3" />
              <p className="text-[#5d5d5d]">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-[#fbf5dc] border-[#e39a22]/30 max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-[#13120f] flex items-center gap-3">
                  Order {selectedOrder.id}
                  <Badge className={`${statusConfig[selectedOrder.status].color} text-white`}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20">
                  <h4 className="font-semibold text-[#13120f] mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#5d5d5d]">Name</p>
                      <p className="font-medium text-[#13120f]">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#5d5d5d]">Phone</p>
                      <p className="font-medium text-[#13120f]">{selectedOrder.customerPhone}</p>
                    </div>
                    {selectedOrder.tableNumber && (
                      <div>
                        <p className="text-sm text-[#5d5d5d]">Table</p>
                        <p className="font-medium text-[#13120f]">{selectedOrder.tableNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[#5d5d5d]">Order Type</p>
                      <p className="font-medium text-[#13120f] capitalize">{selectedOrder.orderType}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20">
                  <h4 className="font-semibold text-[#13120f] mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-[#e9e9e9] last:border-0">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="font-medium text-[#13120f]">{item.name}</p>
                            <p className="text-sm text-[#5d5d5d]">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-[#13120f]">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20">
                  <h4 className="font-semibold text-[#13120f] mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5d5d5d]">Subtotal</span>
                      <span className="text-[#13120f]">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5d5d5d]">Tax</span>
                      <span className="text-[#13120f]">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5d5d5d]">Discount</span>
                        <span className="text-green-600">-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#e9e9e9]">
                      <span className="text-[#13120f]">Total</span>
                      <span className="text-[#e39a22]">${selectedOrder.finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-1">Special Instructions</h4>
                    <p className="text-yellow-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                        setIsDetailsOpen(false);
                      }}
                      className="bg-[#e39a22] text-[#13120f]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Mark as {statusConfig[getNextStatus(selectedOrder.status)!].label}
                    </Button>
                  )}
                  
                  {selectedOrder.paymentStatus === 'pending' && (
                    <Button
                      variant="outline"
                      onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid')}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Paid
                    </Button>
                  )}
                  
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        cancelOrder(selectedOrder.id);
                        toast.success('Order cancelled');
                        setIsDetailsOpen(false);
                      }}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
