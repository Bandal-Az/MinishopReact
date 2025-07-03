import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <h3 className="admin-title">🛠️ 관리자 페이지</h3>
        <ul>
            <li>
                <NavLink to="/admin/members" end className={({ isActive }) => (isActive ? 'active' : '')}>
                회원 관리
                </NavLink>
            </li>
            <li>
                <NavLink to="/admin/products" end className={({ isActive }) => (isActive ? 'active' : '')}>
                상품 관리
                </NavLink>
            </li>
            <li>
                <NavLink to="/admin/products/create" className={({ isActive }) => (isActive ? 'active' : '')}>
                상품 등록
                </NavLink>
            </li>
            <li>
                <NavLink to="/admin/orders" end className={({ isActive }) => (isActive ? 'active' : '')}>
                주문 관리
                </NavLink>
            </li>
        </ul>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
