import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  UtensilsCrossed,
  Star,
  Truck
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useMenu } from '@/hooks/useMenu';

export default function AnalyticsDashboard() {
  const { orders, getTodayOrders } = useOrders();
  const { menuItems } = useMenu();

  const todayOrders = getTodayOrders();

  // Calculate analytics
  const analytics = useMemo(() => {
    // Today's stats
    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.finalAmount, 0);
    
    const todayOrderCount = todayOrders.length;
    const todayAvgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0;

    // All time stats
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.finalAmount, 0);
    
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Order type breakdown
    const typeBreakdown = orders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment method breakdown
    const paymentBreakdown = orders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top selling items
    const itemSales = orders.flatMap(o => o.items).reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item, totalQuantity: 0, totalRevenue: 0 };
      }
      acc[item.id].totalQuantity += item.quantity;
      acc[item.id].totalRevenue += item.price * item.quantity;
      return acc;
    }, {} as Record<string, any>);

    const topSellingItems = Object.values(itemSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Category performance
    const categorySales = menuItems.reduce((acc, item) => {
      const sales = itemSales[item.id];
      if (sales) {
        if (!acc[item.category]) {
          acc[item.category] = { revenue: 0, count: 0 };
        }
        acc[item.category].revenue += sales.totalRevenue;
        acc[item.category].count += sales.totalQuantity;
      }
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    return {
      todayRevenue,
      todayOrderCount,
      todayAvgOrderValue,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      statusBreakdown,
      typeBreakdown,
      paymentBreakdown,
      topSellingItems,
      categorySales,
    };
  }, [orders, todayOrders, menuItems]);

  const statCards = [
    {
      title: "Today's Revenue",
      value: `$${analytics.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+8.5%',
      trendUp: true,
      color: 'bg-green-500',
    },
    {
      title: "Today's Orders",
      value: analytics.todayOrderCount.toString(),
      icon: ShoppingBag,
      trend: '+12%',
      trendUp: true,
      color: 'bg-[#e39a22]',
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics.todayAvgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      trend: '+3.2%',
      trendUp: true,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: 'All time',
      trendUp: true,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white border-[#e39a22]/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#5d5d5d] mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#13120f]">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">{stat.trend}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <Card className="bg-white border-[#e39a22]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#e39a22]" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                const percentage = (count / analytics.totalOrders) * 100;
                const colors: Record<string, string> = {
                  pending: 'bg-orange-500',
                  preparing: 'bg-blue-500',
                  ready: 'bg-purple-500',
                  served: 'bg-indigo-500',
                  completed: 'bg-green-500',
                  cancelled: 'bg-red-500',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#13120f] capitalize">{status}</span>
                      <span className="text-[#5d5d5d]">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-[#e9e9e9] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Breakdown */}
        <Card className="bg-white border-[#e39a22]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#e39a22]" />
              Order Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(analytics.typeBreakdown).map(([type, count]) => {
                const icons: Record<string, React.ElementType> = {
                  'dine-in': UtensilsCrossed,
                  'takeaway': ShoppingBag,
                  'delivery': Truck,
                };
                const Icon = icons[type] || ShoppingBag;
                const percentage = (count / analytics.totalOrders) * 100;
                
                return (
                  <div key={type} className="text-center p-4 bg-[#fbf5dc] rounded-lg">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-[#e39a22]" />
                    <p className="text-2xl font-bold text-[#13120f]">{count}</p>
                    <p className="text-sm text-[#5d5d5d] capitalize">{type}</p>
                    <p className="text-xs text-[#e39a22]">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card className="bg-white border-[#e39a22]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
            <Star className="w-5 h-5 text-[#e39a22]" />
            Top Selling Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e39a22]/20">
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Item</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Category</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Quantity Sold</th>
                  <th className="text-left py-3 text-sm font-medium text-[#5d5d5d]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topSellingItems.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b border-[#e9e9e9] hover:bg-[#fbf5dc]/50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#e39a22] text-[#13120f] flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-[#13120f]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className="bg-[#e39a22]/10 text-[#e39a22] capitalize">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className="text-[#13120f]">{item.totalQuantity}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-[#e39a22]">${item.totalRevenue.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="bg-white border-[#e39a22]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#e39a22]" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.categorySales).map(([category, data]: [string, any]) => (
              <div key={category} className="p-4 bg-[#fbf5dc] rounded-lg border border-[#e39a22]/20">
                <p className="text-sm text-[#5d5d5d] capitalize mb-1">{category}</p>
                <p className="text-xl font-bold text-[#13120f]">${data.revenue.toFixed(2)}</p>
                <p className="text-sm text-[#e39a22]">{data.count} items sold</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-white border-[#e39a22]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#13120f] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#e39a22]" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(analytics.paymentBreakdown).map(([method, count]) => {
              const percentage = (count / analytics.totalOrders) * 100;
              return (
                <div key={method} className="flex items-center gap-3 p-3 bg-[#fbf5dc] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#e39a22]/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#e39a22]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#13120f] capitalize">{method}</p>
                    <p className="text-sm text-[#5d5d5d]">{count} orders ({percentage.toFixed(1)}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
