import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUSES = ['ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const AdminOrderList = () => {

  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('주문 목록을 불러오지 못했습니다.');
      let data = await res.json();
      data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
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
    if (user?.role !== 'ADMIN') {
      
      navigate('/');
      return;
    }
    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId);
    try {
      const res = await fetch(`http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('상태 변경 실패');
      }
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) return <p>주문 목록을 불러오는 중입니다...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: 'auto' }}>
      <h2>전체 주문 목록</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>주문 ID</th>
            <th>회원 ID</th>
            <th>회원 이름</th>
            <th>이메일</th>
            <th>상태</th> {/* 상태 칸에 select 추가 */}
            <th>주문일</th>
            <th>총 금액</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.memberId}</td>
              <td>{order.memberName}</td>
              <td>{order.memberEmail}</td>
              <td>
                <select
                  value={order.status}
                  disabled={statusUpdatingId === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {statusUpdatingId === order.id && <span> 변경 중...</span>}
              </td>
              <td>{new Date(order.orderDate).toLocaleString()}</td>
              <td>{order.totalPrice?.toLocaleString()}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderList;
