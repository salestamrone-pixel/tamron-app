import React, { createContext, useState, useContext } from 'react';
import { CartItem, Service } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (service: Service, quantity: number) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (service: Service, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.serviceId === service.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { serviceId: service.id, service, quantity }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.serviceId === serviceId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.service.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
