import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getPizzaPrice = (pizza, size) => {
    if (!pizza || !pizza.prices) return 0;
    if (pizza.prices instanceof Map) {
      return pizza.prices.get(size) || 0;
    }
    if (typeof pizza.prices.get === 'function') {
      return pizza.prices.get(size) || 0;
    }
    return pizza.prices[size] || 0;
  };

  const addToCart = (pizza, size, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.pizza._id === pizza._id && item.size === size
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { pizza, size, quantity }];
      }
    });
  };

  const removeFromCart = (pizzaId, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.pizza._id === pizzaId && item.size === size))
    );
  };

  const updateQuantity = (pizzaId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pizzaId, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.pizza._id === pizzaId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derive cart statistics
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    const price = getPizzaPrice(item.pizza, item.size);
    return total + price * item.quantity;
  }, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    getPizzaPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
