import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 서버에서 장바구니 정보 불러오기
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/carts', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('장바구니 불러오기 실패');
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      console.error(err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 장바구니에 상품 추가 또는 수량 증가
  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/carts/items', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      if (!res.ok) throw new Error('장바구니 추가 실패');
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      console.error(err);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  // 장바구니에서 상품 제거
  const removeFromCart = async (cartItemId) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`http://localhost:8080/api/carts/items/${cartItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('장바구니 삭제 실패');
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      console.error(err);
      alert('장바구니 삭제 중 오류가 발생했습니다.');
    }
  };

  // 장바구니 상품 수량 변경
  const updateQuantity = async (cartItemId, quantity) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`http://localhost:8080/api/carts/items/${cartItemId}?quantity=${quantity}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('수량 변경 실패');
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      console.error(err);
      alert('수량 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
