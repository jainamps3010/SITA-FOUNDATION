import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) return prev.map((i) => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((i) => i._id === id ? { ...i, qty } : i));
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const marketTotal = cart.reduce((s, i) => s + i.market_price * i.qty, 0);
  const sitaTotal = cart.reduce((s, i) => s + i.sita_price * i.qty, 0);
  const foundationFee = Math.round(marketTotal * 0.02);
  const totalPayable = sitaTotal + foundationFee;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, marketTotal, sitaTotal, foundationFee, totalPayable }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
