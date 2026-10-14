import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (user?.role === 'CUSTOMER') {
      const { data } = await api.get('/cart');
      setItems(data);
    } else {
      setItems([]);
    }
  }, [user]);

  useEffect(() => { refresh().catch(() => {}); }, [refresh]);

  const add = async (foodId, quantity = 1) => {
    const { data } = await api.post('/cart', { foodId, quantity });
    setItems(data);
  };
  const setQty = async (id, quantity) => {
    const { data } = await api.put(`/cart/${id}`, { quantity });
    setItems(data);
  };
  const remove = async (id) => {
    const { data } = await api.delete(`/cart/${id}`);
    setItems(data);
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, add, setQty, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
