import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';

import CartPage from './pages/mypage/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/mypage/WishlistPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';

import MyPageEdit from './pages/mypage/MyPageEdit';
import MyPage from './pages/mypage/MyPage';
import OrderList from './pages/mypage/OrderList';
import OrderDetail from './pages/mypage/OrderDetail';
import MyReviewsPage from './pages/mypage/MyReviewsPage';

import MypageLayout from './pages/mypage/MypageLayout';

import AdminLayout from './pages/admin/AdminLayout'; 
import AdminMemberPage from './pages/admin/AdminMemberPage';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminProductCreatePage from './pages/admin/AdminProductCreatePage';
import AdminProductEditPage from './pages/admin/AdminProductEditPage';
import AdminProductList from './pages/admin/AdminProductList';
import NotificationsPage from './pages/mypage/NotificationsPage';

const AppContent = () => {
  const location = useLocation();

  const noNavbarPaths = ['/login', '/register'];

  return (
    <>
      {!noNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        {/* 관리자 페이지 관련 경로를 AdminLayout으로 묶음 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminMemberPage />} />
          <Route path="members" element={<AdminMemberPage />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="products" element={<AdminProductList />} /> {/* 상품 목록 */}
          <Route path="products/create" element={<AdminProductCreatePage />} />
          <Route path="products/:id/edit" element={<AdminProductEditPage />} />
          {/* 추가 어드민 페이지가 있다면 여기에 넣으세요 */}
        </Route>

        {/* 마이페이지 하위 경로를 MypageLayout으로 묶음 */}
        <Route path="/mypage" element={<MypageLayout />}>
          <Route index element={<MyPage />} />
          <Route path="edit" element={<MyPageEdit />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="reviews" element={<MyReviewsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
