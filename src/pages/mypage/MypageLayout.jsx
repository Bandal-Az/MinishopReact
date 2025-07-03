import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './MypageLayout.css';

const MypageLayout = () => {
  return (
    <div className="mypage-wrapper">
      <aside className="mypage-sidebar">
        <h3 className="mypage-title">👤 마이페이지</h3>
        <ul>
          <li>
            <NavLink to="/mypage" end className={({ isActive }) => (isActive ? 'active' : '')}>
              회원 정보
            </NavLink>
          </li>
          <li>
            <NavLink to="/mypage/wishlist" className={({ isActive }) => (isActive ? 'active' : '')}>
              위시리스트
            </NavLink>
          </li>
          <li>
            <NavLink to="/mypage/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
              주문목록
            </NavLink>
          </li>
          <li>
            <NavLink to="/mypage/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
              장바구니
            </NavLink>
          </li>
          <li>
            <NavLink to="/mypage/reviews" className={({ isActive }) => (isActive ? 'active' : '')}>
              내 리뷰 관리
            </NavLink>
          </li>
          {/* 여기에 알림 메뉴 추가 */}
          <li>
            <NavLink to="/mypage/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>
              내 알림
            </NavLink>
          </li>
        </ul>
      </aside>
      <main className="mypage-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MypageLayout;
