import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user) throw new Error('사용자 정보가 없습니다.');

      const res = await fetch(`http://localhost:8080/api/orders/My?memberId=${user.id}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('주문 목록을 불러오는 데 실패했습니다.');

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (isLoading) return;

    if (!isLoggedIn) {
      
      navigate('/login');
      return;
    }

    if (user?.role !== 'CLIENT') {
      
      navigate('/');
      return;
    }

    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  if (loading) return <p>주문 목록을 불러오는 중입니다...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!orders || orders.length === 0) return <p>주문 내역이 없습니다.</p>;

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>내 주문 목록</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th>주문 ID</th>
            <th>주문 날짜</th>
            <th>상태</th>
            <th>총 금액</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr
              key={order.id}
              style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
              onClick={() => navigate(`/mypage/orders/${order.id}`)}
            >
              <td>{order.id}</td>
              <td>{new Date(order.orderDate).toLocaleString()}</td>
              <td>{order.status}</td>
              <td>{order.totalPrice?.toLocaleString()}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
