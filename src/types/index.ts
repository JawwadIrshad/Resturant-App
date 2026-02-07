// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  image: string;
  stock: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  prepTime?: number; // in minutes
  calories?: number;
  allergens?: string[];
}

// Cart Types
export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order Types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  tax: number;
  discount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number; // in minutes
}

// Stock Types
export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  lastRestocked: string;
  supplier?: string;
  costPerUnit: number;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minThreshold: number;
  alertType: 'low' | 'out' | 'expiring';
  createdAt: string;
  isRead: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface ChatContext {
  currentOrder?: Order;
  currentCart?: CartState;
  lastIntent?: string;
}

// User Types
export type UserRole = 'customer' | 'admin' | 'staff' | 'chef';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
}

// Reservation Types
export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

// Analytics Types
export interface DailySales {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface CategorySales {
  category: string;
  totalSales: number;
  orderCount: number;
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  totalSold: number;
  totalRevenue: number;
}

// App State
export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentView: 'customer' | 'admin' | 'kitchen';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
}
