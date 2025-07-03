import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyPageView = () => {
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

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
  }, [isLoggedIn, user, navigate]);

  if (!user) return <div>로딩중...</div>;

  return (
    <div>
      <h2>회원 정보</h2>
      <p>아이디: {user.username}</p>
      <p>이메일: {user.email}</p>
      <p>닉네임: {user.nickname}</p>
      <p>실명: {user.realName}</p>
      <p>전화번호: {user.phoneNumber}</p>
      <p>주소: {user.address}</p>
      <button onClick={() => navigate('/mypage/edit')}>정보 수정</button>
    </div>
  );
};

export default MyPageView;
