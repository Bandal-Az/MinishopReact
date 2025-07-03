// src/pages/CheckoutPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './CheckoutPage.css';

const clientKey = 'test_ck_ma60RZblrqPqZe2YjqAEVwzYWBn1';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useContext(AuthContext);

  const orderId = params.orderId || (location.state && location.state.orderId);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('주문 ID가 없습니다.');
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || '주문 정보를 불러오는 데 실패했습니다.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;

    try {
      if (!window.TossPayments) {
        alert('결제 SDK가 아직 로드되지 않았습니다.');
        return;
      }

      const tossPayments = window.TossPayments(clientKey);

      const orderName =
        order.orderItems
          .map(item => item.productName || `상품${item.productId}`)
          .join(', ') || '주문 상품';

      await tossPayments.requestPayment('카드', {
        amount: order.totalPrice,
        orderId: order.orderNumber || `order-${order.id}`, // ✅ Toss 규칙 준수
        orderName,
        successUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
        failUrl: `${window.location.origin}/payment/fail?orderId=${order.id}`,
        customerName: user?.realName || '홍길동',
        customerEmail: user?.email || 'customer@example.com',
      });
    } catch (error) {
      alert('결제 진행 중 오류가 발생했습니다: ' + error.message);
      console.error(error);
    }
  };

  const handleGoBackAndCancel = async () => {
    if (!order || !order.id) {
      navigate(-1);
      return;
    }

    const confirmCancel = window.confirm("이 페이지를 떠나면 주문이 자동으로 취소됩니다. 계속할까요?");
    if (confirmCancel) {
      try {
        const cancelRes = await fetch(`http://localhost:8080/api/orders/${order.id}/cancel`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!cancelRes.ok) {
          const errorData = await cancelRes.json();
          throw new Error(errorData.message || '주문 취소 실패');
        }

        alert('주문이 취소되었습니다.');
        navigate('/cart');
      } catch (err) {
        console.error(err);
        alert(`주문 취소 중 오류: ${err.message}`);
        navigate(-1);
      }
    }
  };

  if (loading) return <p style={{ padding: 20 }}>주문 정보를 불러오는 중...</p>;
  if (error) return <p style={{ padding: 20, color: 'red' }}>❌ {error}</p>;
  if (!order) return <p style={{ padding: 20 }}>주문 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">🧾 결제 정보 확인</h2>
      <div className="checkout-info">
        <p><strong>주문 번호:</strong> {order.orderNumber || order.id}</p>
        <p><strong>주문 날짜:</strong> {new Date(order.orderDate).toLocaleString()}</p>
        <p><strong>받는 사람:</strong> {user?.realName || '홍길동'}</p>
        <p><strong>배송 주소:</strong> {user?.address || '서울시 강남구 어딘가 123'}</p>
        <hr />
        <h3>주문 상품 목록</h3>
        {order.orderItems.map((item) => (
          <div key={item.id} className="order-item">
            <p>
              {item.productName || `상품 ID: ${item.productId}`} — 수량: {item.quantity}개 — 가격: {item.price.toLocaleString()} 원 — 합계: {item.totalPrice.toLocaleString()} 원
            </p>
          </div>
        ))}
        <hr />
        <p className="checkout-total">총 결제 금액: {order.totalPrice.toLocaleString()} 원</p>
      </div>

      <button onClick={handlePayment} className="payment-button">
        결제하기
      </button>
      <button onClick={handleGoBackAndCancel} className="back-button">
        ← 이전으로
      </button>
    </div>
  );
};

export default CheckoutPage;
