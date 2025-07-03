import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);

  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [currentFile, setCurrentFile] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);

  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(setForm);

    fetch('http://localhost:8080/api/categories', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const subCategories = data.filter(cat => cat.parentId !== null);
        setCategories(subCategories);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDeleteThumbnail = () => {
    if (window.confirm('썸네일을 삭제하시겠습니까?')) {
      const updatedImageUrls = [...form.imageUrls];
      updatedImageUrls.shift(); // 썸네일 제거
      setForm({ ...form, imageUrls: updatedImageUrls });
      setNewThumbnail(null);
      setNewThumbnailPreview(null);
    }
  };

  const handleDeleteImage = (index) => {
    if (window.confirm('상세 이미지를 삭제하시겠습니까?')) {
      const updatedImageUrls = [...form.imageUrls];
      updatedImageUrls.splice(index + 1, 1); // 썸네일 이후라 +1
      setForm({ ...form, imageUrls: updatedImageUrls });
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
    setNewImagePreviews(prev => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
  };

  const handleCurrentFileChange = (e) => {
    const file = e.target.files[0];
    setCurrentFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCurrentPreview(previewUrl);
    } else {
      setCurrentPreview(null);
    }
  };

  const handleAddImage = () => {
    if (!currentFile) return;
    setNewImages(prev => [...prev, currentFile]);
    setNewImagePreviews(prev => [...prev, currentPreview]);
    setCurrentFile(null);
    setCurrentPreview(null);
  };

  const handleNewThumbnailChange = (e) => {
    const file = e.target.files[0];
    setNewThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedProduct = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    };

    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(updatedProduct)], { type: 'application/json' }));

    if (newThumbnail) {
      formData.append('thumbnail', newThumbnail);
    }

    newImages.forEach(file => {
      formData.append('images', file);
    });

    const res = await fetch(`http://localhost:8080/api/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      
      navigate(`/products/${id}`);
    } else {
      
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        alert('삭제 완료');
        navigate('/admin/products');
      } else {
        alert('삭제 실패');
      }
    }
  };

  if (!form) return <p>로딩 중...</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>상품 수정</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="상품명"
          required
        /><br />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="설명"
          required
        /><br />

        <input
          name="price"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.price}
          onChange={handleChange}
          placeholder="가격"
          required
        /><br />

        <input
          name="stock"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.stock}
          onChange={handleChange}
          placeholder="재고"
          required
        /><br />

        <select
          name="categoryId"
          value={form.categoryId || ''}
          onChange={handleChange}
          required
        >
          <option value="">카테고리 선택</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select><br />

        <hr />

        <h4>📌 기존 썸네일 이미지</h4>
        {form.imageUrls && form.imageUrls.length > 0 ? (
          <div style={{ marginBottom: 12 }}>
            <img
              src={form.imageUrls[0].startsWith('http') ? form.imageUrls[0] : `http://localhost:8080${form.imageUrls[0]}`}
              alt="썸네일"
              style={{ width: '120px', height: 'auto', display: 'block', marginBottom: 6 }}
            />
            <button type="button" onClick={handleDeleteThumbnail} style={{ color: 'red' }}>
              썸네일 삭제
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: 'gray' }}>썸네일 없음 → 새로 등록</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleNewThumbnailChange}
            /><br />
            {newThumbnailPreview && (
              <img
                src={newThumbnailPreview}
                alt="썸네일 미리보기"
                style={{ width: '120px', marginTop: 6 }}
              />
            )}
          </>
        )}

        <hr />

        <h4>🖼️ 기존 상세 이미지</h4>
        {form.imageUrls && form.imageUrls.length > 1 ? (
          form.imageUrls.slice(1).map((url, i) => (
            <div key={url} style={{ marginBottom: 12 }}>
              <img
                src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
                alt={`상세 이미지 ${i}`}
                style={{ width: '100px', height: 'auto', marginRight: '10px' }}
              />
              <button type="button" onClick={() => handleDeleteImage(i)} style={{ color: 'red' }}>
                삭제
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: 'gray' }}>상세 이미지 없음</p>
        )}

        <hr />

        <h4>📥 상세 이미지 추가</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleCurrentFileChange}
        />
        <button
          type="button"
          onClick={handleAddImage}
          disabled={!currentFile}
          style={{ marginLeft: 10 }}
        >
          추가
        </button>

        {currentPreview && (
          <div style={{ marginTop: 10 }}>
            <img
              src={currentPreview}
              alt="미리보기"
              style={{ width: 120, height: 'auto', border: '1px solid #ccc' }}
            />
          </div>
        )}

        {newImagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {newImagePreviews.map((url, idx) => (
              <div key={url} style={{ position: 'relative' }}>
                <img
                  src={url}
                  alt={`추가된 이미지 ${idx + 1}`}
                  style={{ width: 100, height: 'auto', border: '1px solid #ccc' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <br />
        <button type="submit">수정</button>
        <button type="button" onClick={handleDelete} style={{ marginLeft: '1rem', color: 'red' }}>
          삭제
        </button>
      </form>
    </div>
  );
};

export default AdminProductEditPage;
