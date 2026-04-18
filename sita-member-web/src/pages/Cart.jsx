import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdRemove, MdDelete, MdShoppingCart, MdInfo, MdCheckBox, MdCheckBoxOutlineBlank, MdStorefront } from 'react-icons/md';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, marketTotal, sitaTotal, foundationFee, totalPayable } = useCart();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePlaceOrder = async () => {
    if (!agreed) return setError('Please accept the non-refundable terms to proceed.');
    setLoading(true); setError('');
    try {
      const payload = {
        items: cart.map((i) => ({ product_id: i._id, quantity: i.qty, sita_price: i.sita_price, market_price: i.market_price })),
        foundation_fee: foundationFee,
        total_payable: totalPayable,
      };
      await api.post('/orders', payload);
      setSuccess('Order placed successfully!');
      clearCart();
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <div style={styles.emptyWrap}>
        <div className="card" style={styles.emptyCard}>
          <MdShoppingCart style={{ fontSize: '4rem', color: '#BDBDBD', marginBottom: 16 }} />
          <h3 style={{ color: '#424242', marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ color: '#9E9E9E', marginBottom: 24 }}>Add products from the marketplace to get started.</p>
          <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
            <MdStorefront /> Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      {/* Cart Items */}
      <div style={styles.left}>
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span><MdShoppingCart /> Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
            <button style={styles.clearBtn} onClick={clearCart}>Clear All</button>
          </div>

          {success && <div className="alert alert-success">{success}</div>}

          <div style={styles.itemsList}>
            {cart.map((item) => (
              <div key={item._id} style={styles.cartItem}>
                <div style={styles.itemImg}>
                  {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <span style={{ fontSize: '2rem' }}>📦</span>}
                </div>
                <div style={styles.itemDetails}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  {item.unit && <p style={styles.itemUnit}>{item.unit}</p>}
                  <div style={styles.itemPrices}>
                    <span style={styles.itemMrp}>MRP ₹{item.market_price?.toLocaleString('en-IN')}</span>
                    <span style={styles.itemSita}>₹{item.sita_price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div style={styles.itemActions}>
                  <div style={styles.qtyControl}>
                    <button style={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty - 1)}><MdRemove /></button>
                    <span style={styles.qtyNum}>{item.qty}</span>
                    <button style={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty + 1)}><MdAdd /></button>
                  </div>
                  <div style={styles.itemTotal}>₹{(item.sita_price * item.qty).toLocaleString('en-IN')}</div>
                  <button style={styles.deleteBtn} onClick={() => removeFromCart(item._id)}><MdDelete /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div style={styles.right}>
        <div className="card">
          <div className="card-title">Order Summary</div>

          <div style={styles.summaryRows}>
            <div style={styles.summaryRow}>
              <span>Market Price Total</span>
              <span style={{ textDecoration: 'line-through', color: '#9E9E9E' }}>₹{marketTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>SITA Special Price</span>
              <span style={{ color: '#1A237E', fontWeight: 700 }}>₹{sitaTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ ...styles.summaryRow, color: '#2E7D32' }}>
              <span>Your Savings</span>
              <span style={{ fontWeight: 700 }}>-₹{(marketTotal - sitaTotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="divider" />
            <div style={styles.summaryRow}>
              <div>
                <span>Foundation Fee</span>
                <div style={styles.feeNote}><MdInfo /> 2% on market price</div>
              </div>
              <span style={{ color: '#FF8F00', fontWeight: 600 }}>+₹{foundationFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="divider" />
            <div style={{ ...styles.summaryRow, fontSize: '1.1rem', fontWeight: 800, color: '#1A237E' }}>
              <span>Total Payable</span>
              <span>₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Terms */}
          <div style={styles.termsBox}>
            <button style={styles.checkbox} onClick={() => setAgreed(!agreed)}>
              {agreed ? <MdCheckBox style={{ color: '#1A237E', fontSize: '1.4rem' }} /> : <MdCheckBoxOutlineBlank style={{ fontSize: '1.4rem', color: '#9E9E9E' }} />}
            </button>
            <p style={styles.termsText}>
              I understand that all orders are <strong>non-refundable</strong> once placed. Payments will be debited from my SITA Wallet. Foundation fee of 2% on market price applies.
            </p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: 8, fontSize: '1rem', padding: '13px' }}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? <><span className="spinner spinner-sm" /> Placing Order...</> : 'Place Order'}
          </button>

          <button className="btn btn-outline btn-full btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
  left: {},
  right: {},
  emptyWrap: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
  emptyCard: { textAlign: 'center', maxWidth: 400, padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  clearBtn: { background: 'none', border: 'none', color: '#C62828', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: 16 },
  cartItem: { display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F0F0F0' },
  itemImg: { width: 64, height: 64, borderRadius: 8, background: '#F5F5F5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemDetails: { flex: 1, minWidth: 0 },
  itemName: { fontSize: '0.95rem', fontWeight: 700, color: '#212121', marginBottom: 2 },
  itemUnit: { fontSize: '0.78rem', color: '#9E9E9E', marginBottom: 4 },
  itemPrices: { display: 'flex', gap: 8, alignItems: 'center' },
  itemMrp: { fontSize: '0.78rem', color: '#9E9E9E', textDecoration: 'line-through' },
  itemSita: { fontSize: '0.95rem', fontWeight: 800, color: '#1A237E' },
  itemActions: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F5', borderRadius: 8, padding: '4px' },
  qtyBtn: { width: 26, height: 26, border: 'none', background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#1A237E' },
  qtyNum: { font: '700 0.9rem/1 inherit', minWidth: 20, textAlign: 'center', color: '#212121' },
  itemTotal: { fontSize: '0.9rem', fontWeight: 700, color: '#1A237E' },
  deleteBtn: { background: 'none', border: 'none', color: '#C62828', fontSize: '1.2rem', cursor: 'pointer', padding: '2px' },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: 12 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.9rem', color: '#424242' },
  feeNote: { fontSize: '0.75rem', color: '#9E9E9E', display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 },
  termsBox: { display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFF8E1', borderRadius: 8, padding: '12px', marginTop: 16, border: '1px solid #FFE082' },
  checkbox: { background: 'none', border: 'none', padding: 0, flexShrink: 0, cursor: 'pointer' },
  termsText: { fontSize: '0.8rem', color: '#5D4037', lineHeight: 1.5 },
};
