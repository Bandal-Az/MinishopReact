import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const { user, setUser, getUserId, isLoggedIn, isLoading  } = useContext(AuthContext);
  const navigate = useNavigate();

  // 회원 정보 수정 폼
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nickname: '',
    realName: '',
    phoneNumber: '',
    address: '',
  });

  // 비밀번호 변경 폼
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // 메시지 상태
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 접근 제한 처리
  useEffect(() => {

    if (isLoading) return;

    if (!isLoggedIn) {
      
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  // 기존 정보로 초기값 세팅
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        nickname: user.nickname || '',
        realName: user.realName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // 회원 정보 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 비밀번호 입력값 변경 핸들러
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 회원 정보 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updatedMember = {
      id: getUserId(),
      username: formData.username,
      email: formData.email,  // 이메일 수정 불가지만 백엔드에서 무시할 수도 있음
      nickname: formData.nickname,
      realName: formData.realName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/members/${updatedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedMember),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원 정보 수정에 실패했습니다.');
      }

      const data = await response.json();
      setUser(data);
      setSuccess('회원 정보가 성공적으로 수정되었습니다.');
    } catch (err) {
      setError(err.message);
    }
  };

  // 비밀번호 변경 제출
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('모든 비밀번호 입력란을 채워주세요.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/members/${getUserId()}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
      }

      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');

      // 로그아웃 처리
      await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      navigate('/login');

    } catch (err) {
      setError(err.message);
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 회원 탈퇴를 하시겠습니까? 탈퇴하면 복구할 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/members/${getUserId()}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
      }

      alert('회원 탈퇴가 완료되었습니다.');

      // 로그아웃 처리
      await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div>로딩중...</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>회원 정보 수정</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디(변경 불가):</label>
          <input type="text" name="username" value={formData.username} disabled />
        </div>

        <div>
          <label>이메일(변경 불가):</label>
          <input type="email" name="email" value={formData.email} disabled />
        </div>

        <div>
          <label>닉네임:</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
        </div>

        <div>
          <label>실명:</label>
          <input type="text" name="realName" value={formData.realName} onChange={handleChange} />
        </div>

        <div>
          <label>전화번호:</label>
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
        </div>

        <div>
          <label>주소:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>

        <button type="submit">회원 정보 수정</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h3>비밀번호 변경</h3>
      <form onSubmit={handlePasswordSubmit}>
        <div>
          <label>현재 비밀번호:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div>
          <label>새 비밀번호:</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div>
          <label>새 비밀번호 확인:</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <button type="submit">비밀번호 변경</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <button
        onClick={handleDeleteAccount}
        style={{ backgroundColor: 'red', color: 'white', padding: '10px 20px', cursor: 'pointer' }}
      >
        회원 탈퇴
      </button>
    </div>
  );
};

export default MyPage;
