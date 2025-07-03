import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  const handleMyPageClick = () => {
    if (!isLoggedIn) {
      alert('로그인 후 이용하세요');
      navigate('/login');
    } else {
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/mypage');
      }
    }
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: 'bold',
          fontSize: '1.5rem',
          color: '#0070f3',
          textDecoration: 'none',
        }}
      >
        미니쇼핑몰
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isLoggedIn && (
          <span style={{ fontWeight: 'bold', color: '#0070f3' }}>
            {user?.nickname ? `${user.nickname}님 환영합니다` : '환영합니다!'}
          </span>
        )}

        {isLoggedIn && (
          <button
            onClick={handleMyPageClick}
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            👤 마이페이지
          </button>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            로그아웃
          </button>
        ) : (
          <Link
            to="/login"
            style={{ ...buttonStyle, textDecoration: 'none', paddingTop: 6 }}
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  color: '#444',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '8px 12px',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease',
};

export default Navbar;
