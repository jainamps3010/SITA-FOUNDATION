import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import styles from './MarketplacePage.module.css';

const CATEGORIES = ['All', 'grains', 'pulses', 'spices', 'oils', 'dairy', 'vegetables', 'beverages', 'cleaning', 'other'];

const CAT_ICONS = {
  grains: '🌾', pulses: '🫘', spices: '🌶️', oils: '🫙', dairy: '🥛',
  vegetables: '🥦', beverages: '☕', cleaning: '🧹', other: '📦', all: '🛍️',
};

function categoryIcon(cat) {
  return CAT_ICONS[(cat || '').toLowerCase()] || '📦';
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async (cat = selectedCat, q = search) => {
    setLoading(true);
    try {
      let path = '/products?limit=50';
      if (cat && cat !== 'All') path += `&category=${cat}`;
      if (q.trim()) path += `&search=${encodeURIComponent(q.trim())}`;
      const res = await api.get(path);
      setProducts(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCat, search, toast]);

  useEffect(() => { fetchProducts('', ''); }, []);

  const selectCategory = (cat) => {
    const c = cat === 'All' ? '' : cat;
    setSelectedCat(c);
    fetchProducts(c, search);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchProducts(selectedCat, search);
  };

  const handleAddToCart = () => {
    toast('Ordering will be available soon. Stay tuned!', 'info');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>Marketplace</span>
        </div>
        <button className={styles.cartBtn} onClick={() => navigate('/cart')}>
          🛒 {count > 0 && <span className={styles.badge}>{count}</span>}
        </button>
      </div>

      {/* Demo Mode Banner */}
      <div className={styles.demoBanner}>
        <span>⚠️</span>
        <span>Demo Mode - Products shown are for demonstration only. Ordering not available yet.</span>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
        <button className={styles.searchBtn} onClick={() => fetchProducts(selectedCat, search)}>🔍</button>
        {search && (
          <button className={styles.clearBtn} onClick={() => { setSearch(''); fetchProducts(selectedCat, ''); }}>✕</button>
        )}
      </div>

      {/* Categories */}
      <div className={styles.catScroll}>
        {CATEGORIES.map((cat) => {
          const val = cat === 'All' ? '' : cat;
          const active = selectedCat === val;
          return (
            <button
              key={cat}
              className={`${styles.catChip} ${active ? styles.catActive : ''}`}
              onClick={() => selectCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Products */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.center}><div className={styles.spinner} /></div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📦</span>
            <p>No products found.</p>
            <p>Try a different category or search.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={() => handleAddToCart(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product: p, onAdd }) {
  const hasDiscount = p.market_price && p.market_price > p.price_per_unit;
  const savingsPct = hasDiscount
    ? Math.round(((p.market_price - p.price_per_unit) / p.market_price) * 100)
    : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardImg}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className={styles.productImg} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className={styles.catIcon} style={{ display: p.image_url ? 'none' : 'flex' }}>
          <span style={{ fontSize: 40 }}>{categoryIcon(p.category)}</span>
        </div>
        {savingsPct > 0 && <span className={styles.savingsBadge}>{savingsPct}% off</span>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.productName}>{p.name}</div>
        {hasDiscount && (
          <div className={styles.marketPrice}>₹{parseFloat(p.market_price).toFixed(0)}/{p.unit}</div>
        )}
        <div className={styles.sitaPrice}>
          <span className={styles.priceVal}>₹{parseFloat(p.price_per_unit).toFixed(2)}</span>
          <span className={styles.priceUnit}>/{p.unit}</span>
        </div>
        <div className={styles.moq}>Min: {p.moq} {p.unit}</div>
        <button className={styles.comingSoonBtn} onClick={onAdd} disabled>
          Coming Soon
        </button>
      </div>
    </div>
  );
}
