import React, { useState, useEffect } from 'react';
import { MdSearch, MdAddShoppingCart, MdCheckCircle } from 'react-icons/md';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CATEGORIES = ['All', 'Oils', 'Grains', 'Spices', 'Gas', 'Cleaning', 'Other'];

export default function Marketplace() {
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [added, setAdded] = useState({});

  useEffect(() => {
    api.get('/products').then((res) => {
      const data = res.data?.products || res.data || [];
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = category === 'All' || p.category?.toLowerCase() === category.toLowerCase();
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAdded((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [product._id]: false })), 1500);
  };

  const inCart = (id) => cart.some((i) => i._id === id);
  const savings = (p) => p.market_price - p.sita_price;
  const savingPct = (p) => p.market_price > 0 ? Math.round((savings(p) / p.market_price) * 100) : 0;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      {/* Search + Filter */}
      <div style={styles.topRow}>
        <div style={styles.searchWrap}>
          <MdSearch style={styles.searchIcon} />
          <input
            className="form-input"
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.catCount}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Category Tabs */}
      <div style={styles.tabs}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            style={{ ...styles.tab, ...(category === c ? styles.tabActive : {}) }}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <MdSearch style={{ fontSize: '3rem', color: '#BDBDBD' }} />
          <p style={{ color: '#9E9E9E', marginTop: 8 }}>No products found. Try a different search or category.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAdd={() => handleAdd(product)}
              isAdded={added[product._id]}
              inCart={inCart(product._id)}
              savings={savings(product)}
              savingPct={savingPct(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, isAdded, inCart, savings, savingPct }) {
  const outOfStock = product.stock <= 0;

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.img} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={styles.imgPlaceholder}>
            <span style={styles.imgEmoji}>{getCategoryEmoji(product.category)}</span>
          </div>
        )}
        {savingPct > 0 && (
          <div style={styles.savingBadge}>-{savingPct}%</div>
        )}
        {outOfStock && <div style={styles.outBadge}>Out of Stock</div>}
      </div>

      <div style={styles.cardBody}>
        <div style={styles.categoryTag}>{product.category || 'General'}</div>
        <h3 style={styles.productName}>{product.name}</h3>
        {product.unit && <p style={styles.unit}>{product.unit}</p>}

        <div style={styles.priceRow}>
          <div>
            <p style={styles.marketPrice}>₹{product.market_price?.toLocaleString('en-IN')}</p>
            <p style={styles.sitaPrice}>₹{product.sita_price?.toLocaleString('en-IN')}</p>
          </div>
          {savings > 0 && (
            <div style={styles.savingsChip}>
              Save ₹{savings.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        <div style={styles.stockRow}>
          <span style={{ color: outOfStock ? '#C62828' : '#2E7D32', fontSize: '0.78rem', fontWeight: 600 }}>
            {outOfStock ? '● Out of stock' : `● ${product.stock} in stock`}
          </span>
        </div>

        <button
          style={styles.addBtn(isAdded, outOfStock)}
          onClick={onAdd}
          disabled={outOfStock}
        >
          {isAdded ? <><MdCheckCircle /> Added!</> : inCart ? <><MdAddShoppingCart /> Add More</> : <><MdAddShoppingCart /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = { oils: '🫙', grains: '🌾', spices: '🌶️', gas: '🔥', cleaning: '🧹', other: '📦' };
  return map[cat?.toLowerCase()] || '📦';
}

const styles = {
  topRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 },
  searchWrap: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E', fontSize: '1.2rem' },
  searchInput: { paddingLeft: 38 },
  catCount: { fontSize: '0.85rem', color: '#757575', whiteSpace: 'nowrap', fontWeight: 500 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: {
    padding: '7px 16px', borderRadius: 20, border: '1.5px solid #E0E0E0',
    background: '#fff', fontSize: '0.875rem', fontWeight: 500, color: '#616161', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: { background: '#1A237E', borderColor: '#1A237E', color: '#fff', fontWeight: 700 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 18,
  },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(26,35,126,0.08)', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' },
  imgBox: { position: 'relative', height: 160, background: '#F5F5F5' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imgEmoji: { fontSize: '3.5rem' },
  savingBadge: {
    position: 'absolute', top: 10, left: 10,
    background: '#2E7D32', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
    padding: '3px 8px', borderRadius: 6,
  },
  outBadge: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
  },
  cardBody: { padding: '14px 16px' },
  categoryTag: { fontSize: '0.72rem', fontWeight: 700, color: '#FF8F00', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  productName: { fontSize: '0.95rem', fontWeight: 700, color: '#212121', marginBottom: 2, lineHeight: 1.3 },
  unit: { fontSize: '0.78rem', color: '#9E9E9E', marginBottom: 10 },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  marketPrice: { fontSize: '0.8rem', color: '#9E9E9E', textDecoration: 'line-through', marginBottom: 2 },
  sitaPrice: { fontSize: '1.15rem', fontWeight: 800, color: '#1A237E' },
  savingsChip: { background: '#E8F5E9', color: '#2E7D32', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: 6, textAlign: 'right' },
  stockRow: { marginBottom: 12 },
  addBtn: (added, out) => ({
    width: '100%', padding: '9px', border: 'none', borderRadius: 8,
    background: out ? '#E0E0E0' : added ? '#2E7D32' : '#FF8F00',
    color: '#fff', fontWeight: 700, fontSize: '0.875rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    cursor: out ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
  }),
  empty: { textAlign: 'center', padding: '60px 20px' },
};
