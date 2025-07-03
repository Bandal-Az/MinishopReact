import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('주문 정보를 불러오는데 실패했습니다.');
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    setCancelLoading(true);
    setCancelError('');
    setCancelSuccess('');
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || '주문 취소에 실패했습니다.');
      }
      const data = await res.json();
      setOrder(data);
      setCancelSuccess('주문이 성공적으로 취소되었습니다.');
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {

    if (isLoading) return;

    // 로그인 안 했을 경우
    if (!isLoggedIn) {
      
      navigate('/login');
      return;
    }

    // role이 client가 아닐 경우
    if (user?.role !== 'CLIENT') {
      
      navigate('/');
      return;
    }

    fetchOrder();
  }, [id, isLoggedIn, user, navigate]);

  if (loading) return <p>주문 정보를 불러오는 중입니다...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!order) return <p>주문 정보를 찾을 수 없습니다.</p>;

  const canCancel =
    order.status !== '취소됨' &&
    order.status !== 'CANCELLED' &&
    order.status !== '배송완료';

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>주문 상세 (ID: {order.id})</h2>
      <p>
        <strong>주문 날짜:</strong> {new Date(order.orderDate).toLocaleString()}
      </p>
      <p>
        <strong>상태:</strong> {order.status}
      </p>
      <p>
        <strong>총 금액:</strong> {order.totalPrice?.toLocaleString()}원
      </p>

      <h3>주문 상품 목록</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th>상품명</th>
            <th>수량</th>
            <th>가격</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems && order.orderItems.length > 0 ? (
            order.orderItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.price?.toLocaleString()}원</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">주문 상품이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {cancelError && <p style={{ color: 'red' }}>{cancelError}</p>}
      {cancelSuccess && <p style={{ color: 'green' }}>{cancelSuccess}</p>}

      <button onClick={cancelOrder} disabled={cancelLoading || !canCancel}>
        {cancelLoading ? '취소 중...' : '주문 취소'}
      </button>

      <button onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
        목록으로 돌아가기
      </button>
    </div>
  );
};

export default OrderDetail;
