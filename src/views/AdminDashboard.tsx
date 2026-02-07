import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat
} from 'lucide-react';

// Components
import StockManagement from '@/components/admin/StockManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { useOrders } from '@/hooks/useOrders';
import { useStock } from '@/hooks/useStock';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { orders, getTodayOrders, getPendingOrders } = useOrders();
  const { alerts, getLowStockItems, getOutOfStockItems } = useStock();

  const todayOrders = getTodayOrders();
  const pendingOrders = getPendingOrders();
  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();

  // Calculate stats
  const todayRevenue = todayOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.finalAmount, 0);
  
  const pendingOrderCount = pendingOrders.length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const statsCards = [
    {
      title: "Today's Revenue",
      value: `$${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'bg-green-500',
    },
    {
      title: "Today's Orders",
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      trend: '+5%',
      trendUp: true,
      color: 'bg-[#e39a22]',
    },
    {
      title: 'Pending Orders',
      value: pendingOrderCount.toString(),
      icon: Clock,
      trend: 'Active',
      trendUp: true,
      color: 'bg-orange-500',
    },
    {
      title: 'Stock Alerts',
      value: unreadAlerts.toString(),
      icon: AlertTriangle,
      trend: 'Attention',
      trendUp: false,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf5dc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#13120f] mb-2">Admin Dashboard</h1>
          <p className="text-[#5d5d5d]">Manage your restaurant operations</p>
        </div>

        {/* Stats Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <Card key={index} className="bg-white border-[#e39a22]/20 hover:border-[#e39a22]/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-[#5d5d5d] mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-[#13120f]">{stat.value}</p>
                        <Badge 
                          variant="secondary" 
                          className={`mt-2 ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {stat.trend}
                        </Badge>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Order Status */}
              <Card className="bg-white border-[#e39a22]/20">
                <CardHeader>
                  <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#e39a22]" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-[#13120f]">Pending</span>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        {orders.filter(o => o.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ChefHat className="w-5 h-5 text-blue-500" />
                        <span className="text-[#13120f]">Preparing</span>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {orders.filter(o => o.status === 'preparing').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-[#13120f]">Completed Today</span>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        {todayOrders.filter(o => o.status === 'completed').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card className="bg-white border-[#e39a22]/20">
                <CardHeader>
                  <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#e39a22]" />
                    Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-[#13120f]">Out of Stock</span>
                      </div>
                      <Badge variant="destructive">
                        {outOfStockItems.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="text-[#13120f]">Low Stock</span>
                      </div>
                      <Badge className="bg-orange-500 text-white">
                        {lowStockItems.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-[#13120f]">In Stock</span>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Good
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-[#e39a22]/20 mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f]"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f]"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="stock"
              className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f]"
            >
              <Package className="w-4 h-4 mr-2" />
              Stock
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f]"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {/* Recent Orders */}
            <Card className="bg-white border-[#e39a22]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-[#13120f]">Recent Orders</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="border-[#e39a22] text-[#e39a22]"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e39a22]/20">
                        <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Order ID</th>
                        <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Customer</th>
                        <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Items</th>
                        <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Total</th>
                        <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-[#e9e9e9]">
                          <td className="py-3 text-sm text-[#13120f] font-medium">{order.id}</td>
                          <td className="py-3 text-sm text-[#5d5d5d]">{order.customerName}</td>
                          <td className="py-3 text-sm text-[#5d5d5d]">{order.items.length} items</td>
                          <td className="py-3 text-sm text-[#13120f] font-semibold">${order.finalAmount.toFixed(2)}</td>
                          <td className="py-3">
                            <Badge 
                              className={`
                                ${order.status === 'completed' ? 'bg-green-500' : ''}
                                ${order.status === 'preparing' ? 'bg-blue-500' : ''}
                                ${order.status === 'pending' ? 'bg-orange-500' : ''}
                                ${order.status === 'cancelled' ? 'bg-red-500' : ''}
                                text-white
                              `}
                            >
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="stock" className="mt-0">
            <StockManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
