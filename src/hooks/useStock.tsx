import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { StockItem, StockAlert } from '@/types';

interface StockContextType {
  stock: StockItem[];
  alerts: StockAlert[];
  updateStock: (itemId: string, quantity: number) => void;
  addStock: (item: Omit<StockItem, 'id'>) => StockItem;
  updateStockItem: (itemId: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (itemId: string) => void;
  getLowStockItems: () => StockItem[];
  getOutOfStockItems: () => StockItem[];
  getStockByCategory: (category: string) => StockItem[];
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  restockItem: (itemId: string, amount: number) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

// Generate sample stock data
const generateSampleStock = (): StockItem[] => [
  { id: 'STK-001', name: 'Wagyu Beef Patties', category: 'Meat', quantity: 25, unit: 'pcs', minThreshold: 10, maxThreshold: 50, lastRestocked: '2024-01-15', supplier: 'Premium Meats Co.', costPerUnit: 8.5 },
  { id: 'STK-002', name: 'Arborio Rice', category: 'Grains', quantity: 8, unit: 'kg', minThreshold: 15, maxThreshold: 40, lastRestocked: '2024-01-10', supplier: 'Italian Imports', costPerUnit: 4.2 },
  { id: 'STK-003', name: 'Fresh Lobster', category: 'Seafood', quantity: 3, unit: 'pcs', minThreshold: 5, maxThreshold: 15, lastRestocked: '2024-01-16', supplier: 'Ocean Fresh', costPerUnit: 25.0 },
  { id: 'STK-004', name: 'Burrata Cheese', category: 'Dairy', quantity: 0, unit: 'pcs', minThreshold: 8, maxThreshold: 20, lastRestocked: '2024-01-14', supplier: 'Artisan Dairy', costPerUnit: 6.75 },
  { id: 'STK-005', name: 'Truffle Oil', category: 'Oils', quantity: 12, unit: 'bottles', minThreshold: 5, maxThreshold: 20, lastRestocked: '2024-01-12', supplier: 'Gourmet Oils', costPerUnit: 18.5 },
  { id: 'STK-006', name: 'Fresh Basil', category: 'Herbs', quantity: 2, unit: 'bunches', minThreshold: 10, maxThreshold: 25, lastRestocked: '2024-01-16', supplier: 'Local Farms', costPerUnit: 2.5 },
  { id: 'STK-007', name: 'Dark Chocolate 70%', category: 'Baking', quantity: 45, unit: 'bars', minThreshold: 15, maxThreshold: 50, lastRestocked: '2024-01-08', supplier: 'ChocoDelight', costPerUnit: 3.25 },
  { id: 'STK-008', name: 'Avocados', category: 'Produce', quantity: 18, unit: 'pcs', minThreshold: 12, maxThreshold: 30, lastRestocked: '2024-01-16', supplier: 'Tropical Fruits', costPerUnit: 1.75 },
  { id: 'STK-009', name: 'Salmon Fillets', category: 'Seafood', quantity: 6, unit: 'pcs', minThreshold: 8, maxThreshold: 20, lastRestocked: '2024-01-15', supplier: 'Ocean Fresh', costPerUnit: 12.0 },
  { id: 'STK-010', name: 'Pizza Dough', category: 'Bakery', quantity: 30, unit: 'balls', minThreshold: 15, maxThreshold: 40, lastRestocked: '2024-01-16', supplier: 'Artisan Bakery', costPerUnit: 1.5 },
];

// Generate alerts from stock
const generateAlerts = (stock: StockItem[]): StockAlert[] => {
  const alerts: StockAlert[] = [];
  stock.forEach((item) => {
    if (item.quantity === 0) {
      alerts.push({
        id: `ALT-${item.id}-OUT`,
        itemId: item.id,
        itemName: item.name,
        currentStock: item.quantity,
        minThreshold: item.minThreshold,
        alertType: 'out',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    } else if (item.quantity < item.minThreshold) {
      alerts.push({
        id: `ALT-${item.id}-LOW`,
        itemId: item.id,
        itemName: item.name,
        currentStock: item.quantity,
        minThreshold: item.minThreshold,
        alertType: 'low',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }
  });
  return alerts;
};

export function StockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<StockItem[]>(generateSampleStock());
  const [alerts, setAlerts] = useState<StockAlert[]>(() => generateAlerts(generateSampleStock()));

  const updateStock = useCallback((itemId: string, quantity: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  }, []);

  const addStock = useCallback((item: Omit<StockItem, 'id'>): StockItem => {
    const newItem: StockItem = {
      ...item,
      id: `STK-${String(stock.length + 1).padStart(3, '0')}`,
    };
    setStock((prev) => [...prev, newItem]);
    return newItem;
  }, [stock.length]);

  const updateStockItem = useCallback((itemId: string, updates: Partial<StockItem>) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const deleteStockItem = useCallback((itemId: string) => {
    setStock((prev) => prev.filter((item) => item.id !== itemId));
    setAlerts((prev) => prev.filter((alert) => alert.itemId !== itemId));
  }, []);

  const getLowStockItems = useCallback(() => {
    return stock.filter((item) => item.quantity > 0 && item.quantity < item.minThreshold);
  }, [stock]);

  const getOutOfStockItems = useCallback(() => {
    return stock.filter((item) => item.quantity === 0);
  }, [stock]);

  const getStockByCategory = useCallback((category: string) => {
    return stock.filter((item) => item.category === category);
  }, [stock]);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const restockItem = useCallback((itemId: string, amount: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.min(item.maxThreshold, item.quantity + amount),
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
    // Remove related alerts
    setAlerts((prev) => prev.filter((alert) => alert.itemId !== itemId));
  }, []);

  const value = useMemo(
    () => ({
      stock,
      alerts,
      updateStock,
      addStock,
      updateStockItem,
      deleteStockItem,
      getLowStockItems,
      getOutOfStockItems,
      getStockByCategory,
      markAlertAsRead,
      clearAllAlerts,
      restockItem,
    }),
    [stock, alerts, updateStock, addStock, updateStockItem, deleteStockItem, getLowStockItems, getOutOfStockItems, getStockByCategory, markAlertAsRead, clearAllAlerts, restockItem]
  );

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
