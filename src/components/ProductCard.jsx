// src/components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <article
      style={{
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgb(0 0 0 / 0.05)',
        transition: 'box-shadow 0.2s ease',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgb(0 0 0 / 0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgb(0 0 0 / 0.05)')}
    >
      <img
        src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:8080${product.imageUrls[0]}`}

        alt={product.name}
        style={{
          width: '100%',
          height: 180,
          objectFit: 'contain',
          marginBottom: 12,
          borderRadius: 6,
        }}
      />
      <h3 style={{ fontSize: '1.1rem', marginBottom: 8, fontWeight: '600', flexGrow: 1 }}>
        {product.name}
      </h3>
      <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0070f3' }}>
        {product.price.toLocaleString()} 원
      </p>
    </article>
  );
};

export default ProductCard;
