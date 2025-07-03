import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const [wishlists, setWishlists] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 접근 제한 처리
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

  // 위시리스트 데이터 불러오기
  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/wishlists', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setWishlists(data);
        } else {
          alert('위시리스트를 불러오는 중 오류가 발생했습니다.');
        }
      } catch (err) {
        console.error('위시리스트를 불러오는 중 오류가 발생했습니다.', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && user?.role === 'CLIENT') {
      fetchWishlists();
    }
  }, [isLoggedIn, user]);

  const toggleSelect = (id) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((itemId) => itemId !== id)
        : [...prevSelectedIds, id]
    );
  };

  const handleNavigateToDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleDeleteWishlist = async (ids) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        for (let id of ids) {
          const response = await fetch(`http://localhost:8080/api/wishlists/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (response.ok) {
            setWishlists((prev) => prev.filter((item) => item.id !== id));
          } else {
            alert('위시리스트 삭제 실패');
          }
        }
      } catch (err) {
        console.error('위시리스트 삭제 중 오류가 발생했습니다.', err);
      }
    }
  };

  const handleDeleteSelectedWishlist = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 아이템을 선택해주세요.');
      return;
    }
    await handleDeleteWishlist(selectedIds);
  };

  return (
    <div className="wishlist-page">
      <h2>위시리스트</h2>

      {loading ? (
        <p className="loading">⏳ 로딩 중...</p>
      ) : (
        <div className="wishlist-items">
          {wishlists.length === 0 ? (
            <p>위시리스트에 아이템이 없습니다.</p>
          ) : (
            wishlists.map((item) => (
              <div key={item.id} className="wishlist-item">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
                <img
                  src={
  item.productImageUrl
    ? (item.productImageUrl.startsWith('http')
        ? item.productImageUrl
        : `http://localhost:8080${item.productImageUrl}`)
    : 'https://via.placeholder.com/150'
}
                  alt={item.productName || '상품 이미지'}
                  onClick={() => handleNavigateToDetail(item.productId)}
                />
                <div
                  className="wishlist-item-info"
                  onClick={() => handleNavigateToDetail(item.productId)}
                >
                  <p className="product-name">{item.productName}</p>
                  <p className="product-price">{item.productPrice} 원</p>
                </div>
                <button onClick={() => handleDeleteWishlist([item.id])}>삭제</button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="wishlist-footer">
        <label>
          <input
            type="checkbox"
            checked={selectedIds.length === wishlists.length && wishlists.length > 0}
            onChange={() => {
              if (selectedIds.length === wishlists.length) {
                setSelectedIds([]);
              } else {
                setSelectedIds(wishlists.map((item) => item.id));
              }
            }}
          />
          전체 선택
        </label>
        <button onClick={handleDeleteSelectedWishlist} disabled={selectedIds.length === 0}>
          선택 삭제
        </button>
      </div>
    </div>
  );
};

export default WishlistPage;
