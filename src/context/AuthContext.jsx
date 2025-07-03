import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ 추가

  // 로그인된 사용자 정보 가져오기
  const fetchMe = () => {
    setIsLoading(true); // ⬅️ 시작 시 로딩
    fetch('http://localhost:8080/api/auth/me', {
      credentials: 'include', // 인증 쿠키 포함
    })
      .then(res => {
        if (!res.ok) throw new Error('로그인 필요');
        return res.json();
      })
      .then(data => {
        setIsLoggedIn(true);
        setUser(data);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false); // ⬅️ 완료 시 로딩 해제
      });
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const getUserId = () => (user ? user.id : null);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        fetchMe,
        getUserId,
        isLoading, // ⬅️ 추가
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
