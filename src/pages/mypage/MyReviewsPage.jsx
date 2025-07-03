import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 별점 선택 컴포넌트
const StarRating = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const maxStars = 5;

  return (
    <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            style={{
              fontSize: '1.8rem',
              color: starValue <= (hoverRating || rating) ? '#f5a623' : '#e0e0e0',
              transition: 'color 0.1s ease',
            }}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            role="button"
            aria-label={`${starValue} stars`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: '',
    comment: '',
    imageFile: null,
  });

  // 내 리뷰 목록 불러오기
  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/reviews/me', { withCredentials: true });
      setReviews(res.data);
    } catch (err) {
      console.error('리뷰 불러오기 실패', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEditClick = (review) => {
    setEditingId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      imageFile: null,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      rating: '',
      comment: '',
      imageFile: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setEditForm(prev => ({ ...prev, imageFile: files[0] }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append('review', new Blob([JSON.stringify({
        rating: Number(editForm.rating),
        comment: editForm.comment,
      })], { type: 'application/json' }));

      if (editForm.imageFile) {
        formData.append('imageFile', editForm.imageFile);
      }

      await axios.put(`http://localhost:8080/api/reviews/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('리뷰가 수정되었습니다.');
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error('리뷰 수정 실패', err);
      alert('리뷰 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/reviews/${id}`, { withCredentials: true });
      alert('리뷰가 삭제되었습니다.');
      fetchReviews();
    } catch (err) {
      console.error('리뷰 삭제 실패', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  // 이미지 삭제 처리
  const handleImageDelete = async (review) => {
    // 새로 첨부한 이미지가 있을 경우 그냥 제거
    if (editForm.imageFile) {
      setEditForm(prev => ({ ...prev, imageFile: null }));
      return;
    }

    // 서버에 저장된 이미지 삭제 요청
    if (review.imageUrl) {
      if (!window.confirm('이미지를 삭제하시겠습니까?')) return;

      try {
        await axios.delete(`http://localhost:8080/api/reviews/${review.id}/image`, { withCredentials: true });
        alert('이미지가 삭제되었습니다.');
        fetchReviews();
        setEditingId(null);
      } catch (err) {
        console.error('이미지 삭제 실패', err);
        alert('이미지 삭제에 실패했습니다.');
      }
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

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: '1rem' }}>
      <h2>내 리뷰 목록</h2>
      {reviews.length === 0 && <p>작성한 리뷰가 없습니다.</p>}

      {reviews.map(review => (
        <div key={review.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          {editingId === review.id ? (
            <>
              <label>
                평점:
                <StarRating
                  rating={editForm.rating}
                  setRating={(val) => setEditForm(prev => ({ ...prev, rating: val }))}
                />
              </label>
              <br />
              <label>
                내용:
                <textarea
                  name="comment"
                  value={editForm.comment}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </label>
              <br />
              <label>
                이미지 첨부:
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
              <br />

              {/* 이미지 미리보기 및 삭제 버튼 */}
              {(editForm.imageFile || review.imageUrl) && (
                <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                  <img
                    src={
                      editForm.imageFile
                        ? URL.createObjectURL(editForm.imageFile)
                        : (review.imageUrl.startsWith('http')
                          ? review.imageUrl
                          : `http://localhost:8080${review.imageUrl}`)
                    }
                    alt="미리보기"
                    style={{ width: 120 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(review)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      border: 'none',
                      width: 24,
                      height: 24,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    aria-label="이미지 삭제"
                  >
                    ×
                  </button>
                </div>
              )}
              <br />
              <button onClick={() => handleUpdate(review.id)}>저장</button>
              <button onClick={handleCancel} style={{ marginLeft: 8 }}>취소</button>
            </>
          ) : (
            <>
              <div>평점: {renderStars(review.rating)}</div>
              <p>{review.comment}</p>
              {review.imageUrl && (
                <img
                  src={review.imageUrl.startsWith('http') ? review.imageUrl : `http://localhost:8080${review.imageUrl}`}
                  alt="리뷰 이미지"
                  style={{ width: 120 }}
                />
              )}
              <button onClick={() => handleEditClick(review)}>수정</button>
              <button onClick={() => handleDelete(review.id)} style={{ marginLeft: 8, color: 'red' }}>삭제</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyReviewsPage;
