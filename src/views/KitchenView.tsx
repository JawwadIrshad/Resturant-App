import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Flame,
  UtensilsCrossed,
  Package,
  Truck,
  Volume2
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

const orderTypeIcons: Record<string, React.ElementType> = {
  'dine-in': UtensilsCrossed,
  'takeaway': Package,
  'delivery': Truck,
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-orange-500',
  preparing: 'bg-blue-500',
  ready: 'bg-green-500',
  served: 'bg-indigo-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
}

function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const TypeIcon = orderTypeIcons[order.orderType];

  useEffect(() => {
    const interval = setInterval(() => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - created) / 1000 / 60)); // minutes
    }, 60000);
    
    // Initial calculation
    const created = new Date(order.createdAt).getTime();
    const now = Date.now();
    setElapsedTime(Math.floor((now - created) / 1000 / 60));

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const isOverdue = order.estimatedTime && elapsedTime > order.estimatedTime;

  return (
    <Card className={`border-2 ${isOverdue ? 'border-red-400 bg-red-50' : 'border-[#e39a22]/30 bg-white'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-[#13120f]">{order.id}</CardTitle>
              <Badge className={`${statusColors[order.status]} text-white`}>
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#5d5d5d]">
              <TypeIcon className="w-4 h-4" />
              <span className="capitalize">{order.orderType}</span>
              {order.tableNumber && <span>• Table {order.tableNumber}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-[#5d5d5d]'}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{elapsedTime}m</span>
            </div>
            {order.estimatedTime && (
              <p className="text-xs text-[#5d5d5d]">Est: {order.estimatedTime}m</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-[#e9e9e9] last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#e39a22]/20 flex items-center justify-center text-sm font-semibold text-[#e39a22]">
                  {item.quantity}
                </span>
                <span className="text-[#13120f]">{item.name}</span>
              </div>
              {item.prepTime && (
                <span className="text-xs text-[#5d5d5d]">{item.prepTime}m</span>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Special Instructions</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => onStatusUpdate(order.id, 'preparing')}
            >
              <Flame className="w-4 h-4 mr-2" />
              Start Cooking
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onStatusUpdate(order.id, 'ready')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Ready
            </Button>
          )}
          {order.status === 'ready' && order.orderType === 'dine-in' && (
            <Button
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => onStatusUpdate(order.id, 'served')}
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Mark Served
            </Button>
          )}
          {order.status === 'ready' && order.orderType !== 'dine-in' && (
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onStatusUpdate(order.id, 'completed')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function KitchenView() {
  const { orders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState('pending');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast.success(`Order ${orderId} updated to ${status}`);
    
    // Play notification sound if enabled
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVanu87plHQUuh9Dz2YU2Bhxqv+zplkcODVGm5O+4ZSAEMYrO89GFNwYdcfDr4ZdJDQtPp+XysWUeBjiS1/LNfi0GI33R8tOENAcdcO/r4phJDQxPp+XyxGUhBjqT1/PQfS4GI3/R8tSFNwYdcfDr4plHDAtQp+TwxmUgBDeOzvPVhjYGHG3A7+SaSQ0MTKjl8b1kHwU2jc7z1YU1Bhxwv+zmm0gNC1Gn5O/EZSAFNo/M89CEMwYccPDs4ppIDQtRp+TvvWUfBTiOzvPShjUGG3Dw7OKbSA0LUqjl8b1kHwU3jM7z0oU1Bxtw8OzhmUgNC1Ko5fG+ZSAF');
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf5dc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e39a22] flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-[#13120f]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#13120f]">Kitchen Display</h1>
              <p className="text-[#5d5d5d]">Manage orders in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`border-[#e39a22] ${soundEnabled ? 'text-[#e39a22]' : 'text-[#5d5d5d]'}`}
            >
              <Volume2 className="w-5 h-5 mr-2" />
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>
            <div className="text-right">
              <p className="text-sm text-[#5d5d5d]">Active Orders</p>
              <p className="text-2xl font-bold text-[#e39a22]">
                {pendingOrders.length + preparingOrders.length + readyOrders.length}
              </p>
            </div>
          </div>
        </div>

        {/* Order Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-[#e39a22]/20 mb-6">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending
              <Badge className="ml-2 bg-orange-500 text-white">{pendingOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="preparing"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Flame className="w-4 h-4 mr-2" />
              Preparing
              <Badge className="ml-2 bg-blue-500 text-white">{preparingOrders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="ready"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ready
              <Badge className="ml-2 bg-green-500 text-white">{readyOrders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#e39a22]/10 flex items-center justify-center">
                  <Clock className="w-12 h-12 text-[#e39a22]" />
                </div>
                <h3 className="text-xl font-semibold text-[#13120f] mb-2">No pending orders</h3>
                <p className="text-[#5d5d5d]">New orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preparing" className="mt-0">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Flame className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-[#13120f] mb-2">Nothing cooking</h3>
                <p className="text-[#5d5d5d]">Orders being prepared will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparingOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ready" className="mt-0">
            {readyOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-[#13120f] mb-2">No ready orders</h3>
                <p className="text-[#5d5d5d]">Completed orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {readyOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
