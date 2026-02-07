import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { CartItem, CartState, MenuItem } from '@/types';

interface CartContextType {
  cart: CartState;
  addToCart: (item: MenuItem, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; message: string };
  clearCart: () => void;
  isInCart: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialCartState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(initialCartState);

  const calculateTotals = (items: CartItem[]): { totalAmount: number; totalItems: number } => {
    return items.reduce(
      (acc, item) => ({
        totalAmount: acc.totalAmount + item.price * item.quantity,
        totalItems: acc.totalItems + item.quantity,
      }),
      { totalAmount: 0, totalItems: 0 }
    );
  };

  const addToCart = useCallback((item: MenuItem, quantity: number = 1): { success: boolean; message: string } => {
    if (!item.isAvailable) {
      return { success: false, message: `${item.name} is currently unavailable` };
    }

    if (item.stock < quantity) {
      return { success: false, message: `Only ${item.stock} ${item.name} available in stock` };
    }

    setCart((prev) => {
      const existingItem = prev.items.find((i) => i.id === item.id);
      let newItems: CartItem[];

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > item.stock) {
          return prev;
        }
        newItems = prev.items.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      } else {
        newItems = [...prev.items, { ...item, quantity }];
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });

    return { success: true, message: `${item.name} added to cart` };
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId);
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number): { success: boolean; message: string } => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return { success: true, message: 'Item removed from cart' };
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found in cart' };
    }

    if (quantity > item.stock) {
      return { success: false, message: `Only ${item.stock} items available in stock` };
    }

    setCart((prev) => {
      const newItems = prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });

    return { success: true, message: 'Quantity updated' };
  }, [cart.items, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart(initialCartState);
  }, []);

  const isInCart = useCallback((itemId: string) => {
    return cart.items.some((i) => i.id === itemId);
  }, [cart.items]);

  const getItemQuantity = useCallback((itemId: string) => {
    return cart.items.find((i) => i.id === itemId)?.quantity || 0;
  }, [cart.items]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, getItemQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
