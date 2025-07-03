import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { setIsLoggedIn, fetchMe } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // 새로운 시도 전에 기존 에러 메시지 초기화

    if (!formData.username || !formData.password) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: params.toString(),
      });

      if (response.ok) {
        await fetchMe();
        setIsLoggedIn(true);
        navigate('/'); // 로그인 성공 시에만 메인 페이지로 이동
      } else {
        // 로그인 실패 시, 메인 페이지로 이동하지 않고 에러 메시지 표시
        const errorText = await response.text();
        // 백엔드에서 특정 에러 메시지를 제공한다면 사용, 아니면 일반 메시지 표시
        setErrorMessage(errorText || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('서버와 연결할 수 없습니다. 나중에 다시 시도하세요.');
    }
  };

  // 폼 필드가 모두 채워졌는지 확인
  const isFormValid = formData.username.trim() !== '' && formData.password.trim() !== '';

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 60px)', // 헤더 높이를 제외한 화면 중앙 정렬
        backgroundColor: '#f0f2f5', // 부드러운 배경색
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)', // 깊이감 있는 그림자
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#333',
          }}
        >
          로그인
        </h2>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ textAlign: 'left', fontWeight: '600', color: '#555' }}>
            아이디:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                marginTop: '0.4rem',
                marginBottom: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                boxSizing: 'border-box', // padding이 너비에 포함되도록
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0070f3';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
              required
              autoComplete="username"
            />
          </label>
          <label style={{ textAlign: 'left', fontWeight: '600', color: '#555' }}>
            비밀번호:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                marginTop: '0.4rem',
                marginBottom: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0070f3';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
              required
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              backgroundColor: isFormValid ? '#0070f3' : '#a0c8f5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.3s ease, transform 0.1s ease',
              boxShadow: isFormValid ? '0 4px 15px rgba(0, 112, 243, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => { if (isFormValid) e.currentTarget.style.backgroundColor = '#005bb5'; }}
            onMouseLeave={(e) => { if (isFormValid) e.currentTarget.style.backgroundColor = '#0070f3'; }}
            onMouseDown={(e) => { if (isFormValid) e.currentTarget.style.transform = 'scale(0.99)'; }}
            onMouseUp={(e) => { if (isFormValid) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            로그인
          </button>
        </form>

        {errorMessage && (
          <p
            style={{
              color: '#d9230f',
              textAlign: 'center',
              marginTop: '1.5rem',
              fontWeight: '600',
              backgroundColor: '#ffe0e0',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #d9230f',
            }}
          >
            {errorMessage}
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span style={{ color: '#666' }}>계정이 없으신가요? </span>
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.2rem',
              backgroundColor: '#e9ecef',
              color: '#0070f3',
              textDecoration: 'none',
              fontWeight: 'bold',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dee2e6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#e9ecef'; }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;