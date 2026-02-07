import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Order, CartItem, OrderStatus, PaymentMethod } from '@/types';

interface OrdersContextType {
  orders: Order[];
  createOrder: (data: CreateOrderData) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getTodayOrders: () => Order[];
  getPendingOrders: () => Order[];
  cancelOrder: (orderId: string) => void;
}

interface CreateOrderData {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  paymentMethod: PaymentMethod;
  notes?: string;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Generate sample orders
const generateSampleOrders = (): Order[] => {
  const now = new Date();
  return [
    {
      id: 'ORD-001',
      items: [
        { id: '1', name: 'Truffle Arancini', price: 12, quantity: 2, description: '', category: 'starters', image: '', stock: 10, isAvailable: true },
        { id: '5', name: 'Wagyu Beef Burger', price: 28, quantity: 1, description: '', category: 'mains', image: '', stock: 8, isAvailable: true },
      ],
      totalAmount: 52,
      tax: 5.2,
      discount: 0,
      finalAmount: 57.2,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      customerName: 'John Smith',
      customerPhone: '+1 234-567-8901',
      tableNumber: 'A5',
      orderType: 'dine-in',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 82800000).toISOString(),
      estimatedTime: 25,
    },
    {
      id: 'ORD-002',
      items: [
        { id: '3', name: 'Burrata Salad', price: 16, quantity: 1, description: '', category: 'starters', image: '', stock: 15, isAvailable: true },
        { id: '7', name: 'Lobster Risotto', price: 42, quantity: 2, description: '', category: 'mains', image: '', stock: 5, isAvailable: true },
      ],
      totalAmount: 100,
      tax: 10,
      discount: 5,
      finalAmount: 105,
      status: 'preparing',
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      customerName: 'Sarah Johnson',
      customerPhone: '+1 234-567-8902',
      tableNumber: 'B3',
      orderType: 'dine-in',
      notes: 'Extra cheese on risotto',
      createdAt: new Date(now.getTime() - 1800000).toISOString(),
      updatedAt: new Date(now.getTime() - 1500000).toISOString(),
      estimatedTime: 35,
    },
    {
      id: 'ORD-003',
      items: [
        { id: '9', name: 'Chocolate Lava Cake', price: 14, quantity: 3, description: '', category: 'desserts', image: '', stock: 20, isAvailable: true },
      ],
      totalAmount: 42,
      tax: 4.2,
      discount: 0,
      finalAmount: 46.2,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      customerName: 'Mike Davis',
      customerPhone: '+1 234-567-8903',
      orderType: 'takeaway',
      createdAt: new Date(now.getTime() - 600000).toISOString(),
      updatedAt: new Date(now.getTime() - 600000).toISOString(),
      estimatedTime: 15,
    },
  ];
};

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(generateSampleOrders());

  const createOrder = useCallback((data: CreateOrderData): Order => {
    const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = totalAmount * 0.1; // 10% tax
    const discount = 0;
    const finalAmount = totalAmount + tax - discount;

    // Calculate estimated time based on items
    const estimatedTime = data.items.reduce((max, item) => {
      const itemTime = item.prepTime || 20;
      return Math.max(max, itemTime);
    }, 15);

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      items: data.items,
      totalAmount,
      tax,
      discount,
      finalAmount,
      status: 'pending',
      paymentStatus: data.paymentMethod === 'cash' ? 'pending' : 'paid',
      paymentMethod: data.paymentMethod,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableNumber: data.tableNumber,
      orderType: data.orderType,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedTime,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [orders.length]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
  }, []);

  const getOrderById = useCallback((orderId: string) => {
    return orders.find((o) => o.id === orderId);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter((o) => o.status === status);
  }, [orders]);

  const getTodayOrders = useCallback(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return orders.filter((o) => ['pending', 'preparing'].includes(o.status));
  }, [orders]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() }
          : order
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      orders,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      getOrderById,
      getOrdersByStatus,
      getTodayOrders,
      getPendingOrders,
      cancelOrder,
    }),
    [orders, createOrder, updateOrderStatus, updatePaymentStatus, getOrderById, getOrdersByStatus, getTodayOrders, getPendingOrders, cancelOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
