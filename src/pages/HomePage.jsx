import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('상품 불러오기 실패:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('카테고리 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    let filteredProducts = products;

    if (searchTerm.trim()) {
      filteredProducts = filteredProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== null) {
      const childCategoryIds = categories
        .filter((cat) => cat.parentId === selectedCategory)
        .map((cat) => cat.id);
      childCategoryIds.push(selectedCategory);

      filteredProducts = filteredProducts.filter((p) =>
        childCategoryIds.includes(p.categoryId)
      );
    }

    setFiltered(filteredProducts);
  }, [products, searchTerm, selectedCategory, categories]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value === '' ? null : parseInt(e.target.value);
    setSelectedCategory(selected);
  };

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 상단 필터 바 (카테고리 + 검색창) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* 카테고리 드롭다운 */}
        <select
          value={selectedCategory ?? ''}
          onChange={handleCategoryChange}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
            minWidth: 200,
          }}
        >
          <option value="">전체 카테고리</option>
          {categories
            .filter((cat) => cat.parentId === null)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>

        {/* 검색창 */}
        <input
          type="text"
          placeholder="상품 이름 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
      </div>

      {/* 상품 그리드 */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
          gap: '1.5rem',
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
