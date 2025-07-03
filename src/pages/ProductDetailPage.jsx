import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './ProductDetailPage.css'; // 새로 생성한 CSS 파일 import

// SVG 하트 아이콘 컴포넌트
const HeartIcon = ({ filled, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#ff0000' : 'none'}
    stroke="#ff0000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"  
    style={{ display: 'block' }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.72-7.72 1.06-1.06a5.5 5.5 0 0 0 0-7.84z" />
  </svg>
);

// 별점 선택을 위한 StarRating 컴포넌트
const StarRating = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const maxStars = 5;

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            style={{
              cursor: 'pointer',
              fontSize: '1.8rem',
              color: starValue <= (hoverRating || rating) ? '#f5a623' : '#e0e0e0',
              transition: 'color 0.1s ease',
            }}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCartToast, setShowCartToast] = useState(false);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  // 새 리뷰 폼을 위한 상태
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewImage, setNewReviewImage] = useState(null); // 추가: 이미지 파일 상태
  const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기 URL 상태

  const { addToCart } = useContext(CartContext);
  const { isLoggedIn,user} = useContext(AuthContext);

  const [modalImage, setModalImage] = useState(null);

  // 상품 데이터 fetch
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error('상품 조회 실패:', err))
      .finally(() => setLoading(false));
  }, [id]);

  // 위시리스트 확인
  useEffect(() => {
    if (!product) return;
    const checkWishlist = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/wishlists?productId=${product.id}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setIsInWishlist(true);
            setWishlistItemId(data[0].id);
          } else {
            setIsInWishlist(false);
            setWishlistItemId(null);
          }
        } else {
          console.error('위시리스트 확인 실패');
        }
      } catch (err) {
        console.error('위시리스트 확인 중 오류 발생:', err);
      }
    };
    checkWishlist();
  }, [product]);

  // 리뷰 fetch 함수
  const fetchReviews = async () => {
    if (!product) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/reviews/product/${product.id}?page=0&size=10`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('리뷰 불러오기 실패');
      const data = await res.json();
      setReviews(data.content || data);
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  // 컴포넌트 마운트 및 product 변경 시 리뷰 fetch
  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product]);

  // 토스트 메시지 숨기기
  useEffect(() => {
    if (showCartToast || showWishlistToast) {
      const timer = setTimeout(() => {
        setShowCartToast(false);
        setShowWishlistToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCartToast, showWishlistToast]);

  if (loading) return <p style={{ padding: 20 }}>⏳ 로딩 중...</p>;
  if (!product) return <p style={{ padding: 20 }}>❌ 상품을 찾을 수 없습니다.</p>;

  const checkLogin = () => {
    if (!isLoggedIn) {
      alert('로그인 후 이용하세요');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!checkLogin()) return;
    addToCart(product);
    setShowCartToast(true);
  };

  const handleBuyNow = async () => {
  if (!checkLogin()) return;

  try {
    const orderRequest = {
      memberId: user.id,  // 로그인한 사용자 ID
      orderItems: [
        {
          productId: product.id,
          quantity: 1
        }
      ]
    };

    const response = await fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderRequest),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('주문 생성 실패');
    const orderData = await response.json();

    // 주문 ID를 checkout 페이지로 넘김
    navigate('/checkout', { state: { orderId: orderData.id } });

  } catch (err) {
    console.error('주문 처리 실패:', err);
    alert('주문 처리 중 오류가 발생했습니다.');
  }
};

  const handleAddToWishlist = async () => {
    if (!checkLogin()) return;
    if (isInWishlist) {
      alert('이미 위시리스트에 있는 상품입니다.');
      return;
    }
    const wishlistItem = { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrls[0] };
    try {
      const response = await fetch('http://localhost:8080/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishlistItem),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(true);
        setWishlistItemId(data.id);
        setShowWishlistToast(true);
      } else {
        alert('위시리스트 추가 실패');
      }
    } catch (err) {
      console.error('위시리스트 추가 중 오류 발생:', err);
      alert('위시리스트 추가 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!checkLogin()) return;
    if (!wishlistItemId) {
      alert('위시리스트에 없는 상품입니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/wishlists/${wishlistItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setIsInWishlist(false);      // 바로 상태 false 처리
        setWishlistItemId(null);     // ID 초기화
        setShowWishlistToast(false); // 토스트 메시지 숨김

        // 삭제 후 상태 최신화용 추가 요청 (선택)
        if (product) {
          const responseCheck = await fetch(`http://localhost:8080/api/wishlists?productId=${product.id}`, {
            credentials: 'include',
          });
          if (responseCheck.ok) {
            const data = await responseCheck.json();
            setIsInWishlist(data.length > 0);
            setWishlistItemId(data.length > 0 ? data[0].id : null);
          }
        }
      } else {
        alert('위시리스트 삭제 실패');
      }
    } catch (err) {
      console.error('위시리스트 삭제 중 오류 발생:', err);
      alert('위시리스트 삭제 중 오류가 발생했습니다.');
    }
  };


  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!checkLogin()) return;

    if (!newReviewContent.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    if (newReviewRating < 1 || newReviewRating > 5) {
      alert('평점은 1점에서 5점 사이여야 합니다.');
      return;
    }

    const reviewData = {
      productId: product.id,
      rating: newReviewRating,
      comment: newReviewContent,
    };

    const formData = new FormData();
    formData.append('review', new Blob([JSON.stringify(reviewData)], { type: 'application/json' }));

    if (newReviewImage) {
      formData.append('imageFile', newReviewImage);
    }

    try {
      const response = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        alert('리뷰가 성공적으로 작성되었습니다!');
        setNewReviewContent('');
        setNewReviewRating(5);
        setNewReviewImage(null);
        setPreviewImage(null);
        document.getElementById('review-image-upload').value = '';
        fetchReviews();
      } else {
        const errorData = await response.json();
        alert(`리뷰 작성 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('리뷰 작성 중 오류 발생:', error);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    }
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    let stars = '';
    for (let i = 0; i < maxStars; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return stars;
  };

  const ReviewList = () => {
    if (reviewsLoading) return <p>리뷰 로딩 중...</p>;
    if (reviewsError) return <p>리뷰 불러오기 실패: {reviewsError}</p>;
    if (reviews.length === 0) return <p>등록된 후기가 없습니다.</p>;

    return (
      <ul className="review-list">
        {reviews.map(r => (
          <li key={r.id} className="review-item">
            {r.imageUrl && (
              <img
                src={
                  r.imageUrl.startsWith('http://') || r.imageUrl.startsWith('https://')
                    ? r.imageUrl
                    : `http://localhost:8080${r.imageUrl}`
                }
                alt="review-img"
                className="review-image"
                onClick={() => setModalImage(r.imageUrl)}
              />
            )}

            <div className="review-meta">
              <div className="review-stars">{renderStars(r.rating)}</div>
              <div className="review-author">{r.member?.username || '익명'}</div>
              {r.createdAt && (
                <div className="review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <p className="review-content">
              {r.content || r.comment}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <main className="product-detail-main">
        {/* 이미지 및 상품 정보 영역 */}
        <div className="product-image-section">
          <img
            src={
              product.imageUrls[selectedImageIndex]?.startsWith('http://') ||
              product.imageUrls[selectedImageIndex]?.startsWith('https://')
                ? product.imageUrls[selectedImageIndex]
                : `http://localhost:8080${product.imageUrls[selectedImageIndex]}`
            }
            alt={product.name}
            className="product-main-image"
          />
          <div className="product-thumbnails">
            {product.imageUrls.map((url, index) => (
              <img
                key={index}
                src={
                  url.startsWith('http://') || url.startsWith('https://')
                    ? url
                    : `http://localhost:8080${url}`
                }
                alt={`thumbnail-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`product-thumbnail-image ${selectedImageIndex === index ? 'selected' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-description">{product.description}</p>

          <div className="product-price">
            {product.price.toLocaleString()} 원
          </div>

          <hr className="product-info-divider" />

          <div className="product-delivery-info">
            <p>🚚 기본 배송: 2~3일 소요</p>
            <p>🔄 교환/반품 가능 (7일 이내)</p>
          </div>

          {/* 장바구니/위시리스트 토스트 및 버튼 */}
          <div className="product-action-area">
            {showCartToast && (
              <div className="toast-message" onClick={() => navigate('/mypage/cart')}>
                <div>🛒 장바구니에 담겼습니다!</div>
              </div>
            )}

            {showWishlistToast && (
              <div className="toast-message" onClick={() => navigate('/mypage/wishlist')}>
                <div>❤️ 위시리스트에 추가되었습니다!</div>
              </div>
            )}

            <div className="product-buttons-group">
              <button
                onClick={handleAddToCart}
                className="add-to-cart-btn"
              >
                장바구니 담기
              </button>
              <button
                onClick={handleBuyNow}
                className="buy-now-btn"
              >
                바로 구매
              </button>
              {isInWishlist ? (
                <button
                  onClick={handleRemoveFromWishlist}
                  className="wishlist-btn filled"
                >
                  <HeartIcon filled={true} size={20} />
                </button>
              ) : (
                <button
                  onClick={handleAddToWishlist}
                  className="wishlist-btn"
                >
                  <HeartIcon filled={false} size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- 개선된 리뷰 영역: 목록과 작성 폼 --- */}
      <section className="product-review-section">
        {/* 리뷰 목록 부분 */}
        <div className="review-list-container">
          <h2 className="review-section-title">
            상품 후기 ({reviews.length})
          </h2>
          <ReviewList />
        </div>

        {/* 리뷰 작성 폼 부분 */}
        <div className="review-form-container">
          <h2 className="review-section-title">
            후기 작성
          </h2>
          {isLoggedIn ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="review-form-group">
                <label className="review-form-label">평점:</label>
                <StarRating rating={newReviewRating} setRating={setNewReviewRating} />
              </div>
              <div className="review-form-group vertical">
                <label htmlFor="review-content" className="review-form-label">
                  내용:
                </label>
                <textarea
                  id="review-content"
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  placeholder="솔직한 후기를 남겨주세요."
                  rows="6"
                  className="review-textarea"
                ></textarea>
              </div>
              <div className="review-form-group vertical">
                <label htmlFor="review-image-upload" className="review-form-label">이미지:</label>
                <input
                  type="file"
                  id="review-image-upload"
                  accept="image/*"
                  onChange={(e) => {
                    setNewReviewImage(e.target.files?.[0]);
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviewImage(reader.result);
                      };
                      reader.readAsDataURL(e.target.files?.[0]);
                    } else {
                      setPreviewImage(null);
                    }
                  }}
                  className="review-image-upload-input"
                />
                {previewImage && (
                  <div className="review-image-preview">
                    <img
                      src={previewImage}
                      alt="미리보기"
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="submit-review-btn"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bb5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                후기 작성하기
              </button>
            </form>
          ) : (
            <div className="login-to-review-message">
              <p>
                로그인 후 소중한 후기를 작성해주세요!
              </p>
              <button
                onClick={() => navigate('/login')}
                className="login-to-review-btn"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
              >
                로그인하기
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 이미지 확대 모달 */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="image-modal-overlay"
        >
          <img
            src={
              modalImage.startsWith('http://') || modalImage.startsWith('https://')
                ? modalImage // 이미 완전한 URL이면 그대로 사용
                : `http://localhost:8080${modalImage}` // 아니면 'http://localhost:8080'을 붙여서 사용
            }
            alt="확대 이미지"
            className="image-modal-content"
          />
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;