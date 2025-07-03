import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const NotificationsPage = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/notifications', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('알림을 불러오지 못했습니다.');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('읽음 처리 실패');
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('이 알림을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('삭제 실패');
      fetchNotifications();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <p>로그인이 필요합니다.</p>;
  if (loading) return <p>알림 불러오는 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>내 알림</h2>
      {notifications.length === 0 && <p>새 알림이 없습니다.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map((note) => (
          <li
            key={note.id}
            style={{
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: note.isRead ? '#f5f5f5' : '#e6f0ff',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (!note.isRead) markAsRead(note.id);
            }}
          >
            <div>
              <span style={{ marginRight: 8 }}>
                {note.isRead ? '⚪' : '🔵'}
              </span>
              <strong>{note.title}</strong>
              <p style={{ margin: '4px 0' }}>{note.content}</p>
              <small>{new Date(note.createdAt).toLocaleString()}</small>
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#888',
              }}
              onClick={(e) => {
                e.stopPropagation(); // 알림 클릭 방지
                deleteNotification(note.id);
              }}
              title="삭제"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
