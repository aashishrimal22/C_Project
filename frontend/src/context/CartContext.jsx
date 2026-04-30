import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ── Load cart from localStorage on first render ──────────────────────────
  // This means cart survives page reloads (e.g. eSewa redirect back to the site)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Persist cart to localStorage on every change ─────────────────────────
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const navigate = useNavigate();

  // ➕ Add item to cart
  const addToCart = (item) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    setCart((prev) => {
      const existing = prev.find((c) => c.foodid === item.foodid);
      if (existing) {
        return prev.map((c) =>
          c.foodid === item.foodid ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // 🔄 Update item quantity
  const updateQuantity = (itemfoodid, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.foodid !== itemfoodid));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.foodid === itemfoodid ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // 💰 Get total amount
  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // 🧾 Get total item count
  const getCartItemCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  // 🧹 Clear cart — also wipes localStorage
  // Only call this AFTER a confirmed successful order (COD or eSewa success)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // 🛒 Go to order page (with auth check)
  const placeOrder = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (cart.length === 0) { alert("Your cart is empty!"); return; }
    navigate("/order");
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, getCartTotal, getCartItemCount, placeOrder, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
