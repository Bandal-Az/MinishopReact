import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
  });

  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null); // 썸네일 파일
  const [thumbnailPreview, setThumbnailPreview] = useState(null); // 미리보기 URL
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); // 미리보기 URL 리스트

  useEffect(() => {
    fetch('http://localhost:8080/api/categories', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const subCategories = data.filter(cat => cat.parentId !== null);
        setCategories(subCategories);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);
    // 기존 이미지 뒤에 새로 추가
    setImages(prev => [...prev, ...filesArray]);

    // 새로 추가된 이미지 미리보기 생성해서 기존 미리보기 뒤에 붙임
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const product = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    };

    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }));

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    images.forEach(file => {
      formData.append('images', file);
    });

    const res = await fetch('http://localhost:8080/api/products', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      alert('상품 등록 완료');
      const createdProduct = await res.json();
      navigate(`/products/${createdProduct.id}`); // 상세 페이지로 이동
    } else {
      alert('등록 실패');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>상품 등록</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="name"
          placeholder="상품명"
          value={form.name}
          onChange={handleChange}
          required
        /><br />

        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          required
        /><br />

        <input
          name="price"
          type="text"
          placeholder="가격"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.price}
          onChange={handleChange}
          required
        /><br />

        <input
          name="stock"
          type="text"
          placeholder="재고"
          inputMode="numeric"
          pattern="[0-9]*"
          value={form.stock}
          onChange={handleChange}
          required
        /><br />

        <select
          name="categoryId"
          value={form.categoryId}
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

        <label>썸네일 이미지:</label><br />
        <input type="file" accept="image/*" onChange={handleThumbnailChange} /><br />
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="미리보기"
            style={{ width: '150px', height: 'auto', marginTop: '8px' }}
          />
        )}
        <br />

        <label>상세 이미지:</label><br />
        <input type="file" multiple accept="image/*" onChange={handleImageChange} /><br />

        {imagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {imagePreviews.map((url, idx) => (
              <img key={idx} src={url} alt="미리보기" style={{ width: '100px', height: 'auto' }} />
            ))}
          </div>
        )}

        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default AdminProductCreatePage;
