import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminMemberPage = () => {
  const [members, setMembers] = useState([]);
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/members/admin/all', {
        withCredentials: true,
      });
      setMembers(res.data);
    } catch (err) {
      console.error('회원 목록 조회 실패', err);
      alert('회원 정보를 불러오지 못했습니다.');
    }
  };

  const toggleActivation = async (id, isActive) => {
    const endpoint = isActive
      ? `/api/members/admin/${id}/deactivate`
      : `/api/members/admin/${id}/activate`;

    try {
      await axios.put(`http://localhost:8080${endpoint}`, null, {
        withCredentials: true,
      });
      alert(`회원 ${isActive ? '비활성화' : '활성화'} 완료`);
      fetchMembers();
    } catch (err) {
      console.error(`회원 ${isActive ? '비활성화' : '활성화'} 실패`, err);
      alert(err.response?.data || '에러 발생');
    }
  };

  useEffect(() => {

    if (isLoading) return;

    if (!isLoggedIn) {
      
      navigate('/login');
    } else if (user?.role !== 'ADMIN') {
      
      navigate('/');
    } else {
      fetchMembers();
    }
  }, [isLoggedIn, user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
    <div>
      <h2>전체 회원 목록</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>아이디</th>
            <th>이메일</th>
            <th>닉네임</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.username}</td>
              <td>{m.email}</td>
              <td>{m.nickname}</td>
              <td style={{ color: m.isActive ? 'green' : 'red' }}>
                {m.isActive ? '활성' : '비활성'}
              </td>
              <td>
                <button onClick={() => toggleActivation(m.id, m.isActive)}>
                  {m.isActive ? '비활성화' : '활성화'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminMemberPage;
