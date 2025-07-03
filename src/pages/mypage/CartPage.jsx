import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';  // AuthContext import 추가
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css'; // CSS 파일 import

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user, isLoading  } = useContext(AuthContext);  // 로그인 사용자 정보
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  // 로그인 유저 없으면 접근 불가 처리 (원한다면)
  useEffect(() => {

    if (isLoading) return;

    if (!user) {
      
    
      navigate('/login');
    }
  }, [user, navigate]);

  // 총 합계 계산
  const totalPrice = cartItems
    .filter(item => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 개별 선택 토글
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
  };

  // 선택 삭제
  const removeSelected = async () => {
    await Promise.all(selectedIds.map(id => removeFromCart(id)));
    setSelectedIds([]);
  };

  // 결제하기 클릭 시
  const handleCheckout = async () => {
    if (selectedIds.length === 0) {
      alert('하나 이상의 상품을 선택해주세요.');
      return;
    }

    if (!user) {
      
      navigate('/login');
      return;
    }

    try {
      // 주문 생성 요청 - memberId를 하드코딩 대신 로그인 유저 ID 사용
      const orderRequest = {
        memberId: user.id,
        orderItems: cartItems
          .filter(item => selectedIds.includes(item.id))
          .map(item => ({
            productId: item.productId,     // 장바구니 item.id는 상품 ID여야 함
            quantity: item.quantity
          }))
      };

      const orderRes = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest),
        credentials: 'include' // 인증 필요 시
      });

      if (!orderRes.ok) throw new Error('주문 생성 실패');
      const orderData = await orderRes.json();

      // 주문 ID를 결제 페이지로 전달
      navigate('/checkout', { state: { orderId: orderData.id } });

    } catch (err) {
      console.error(err);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => cartItems.some(item => item.id === id)));
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>장바구니가 비어있습니다.</h2>
        <Link to="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const allSelected = selectedIds.length === cartItems.length && cartItems.length > 0;

  return (
    <>
      <div className="cart-container">
        <h2 className="cart-title">장바구니</h2>

        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="select-checkbox"
              />
              <img
                src={
  item.productImageUrl
    ? item.productImageUrl.startsWith('http')
      ? item.productImageUrl
      : `http://localhost:8080${item.productImageUrl}`
    : 'https://via.placeholder.com/150' // 기본 이미지 주소
}
                alt={item.productName || item.name || '상품 이미지'}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <div className="cart-item-name">{item.productName || item.name}</div>
                <div className="cart-item-price">{item.price.toLocaleString()} 원</div>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value, 10);
                  if (!isNaN(qty) && qty > 0) {
                    updateQuantity(item.id, qty);
                  }
                }}
                className="cart-item-quantity"
              />
              <div className="cart-item-total">{(item.price * item.quantity).toLocaleString()} 원</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-footer">
        <label className="select-all-label">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="select-all-input"
          />
          전체 선택
        </label>

        <button
          onClick={removeSelected}
          disabled={selectedIds.length === 0}
          className="remove-selected-btn"
        >
          선택 삭제
        </button>

        <div className="cart-footer-total">
          총 결제 예정금액: {totalPrice.toLocaleString()} 원
        </div>

        <button
          onClick={handleCheckout}
          disabled={selectedIds.length === 0}
          className="checkout-btn"
        >
          구매하기
        </button>
      </div>
    </>
  );
};

export default CartPage;
