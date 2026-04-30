import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import styles from './CartPage.module.css';

export default function CartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, removeItem, updateQty, clear, subtotal, foundationFee, total } = useCart();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!address.trim()) { toast('Please enter delivery address', 'error'); return; }
    if (!accepted) { toast('Please accept the non-refundable terms', 'error'); return; }

    const vendorMap = {};
    for (const item of items) {
      const vid = item.product.vendor?.id || '';
      if (!vendorMap[vid]) vendorMap[vid] = [];
      vendorMap[vid].push(item);
    }

    setLoading(true);
    try {
      for (const [vendorId, vendorItems] of Object.entries(vendorMap)) {
        await api.post('/orders', {
          vendor_id: vendorId,
          items: vendorItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
          delivery_address: address.trim(),
          payment_method: paymentMethod,
        });
      }
      clear();
      toast('Order placed successfully!', 'success');
      navigate('/home');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const payMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'wallet', label: 'SITA Wallet', icon: '👛' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>My Cart</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🛒</span>
          <p>Your cart is empty.</p>
          <p>Add products from the marketplace.</p>
          <button className={styles.shopBtn} onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
        </div>
      ) : (
        <div className={styles.content}>
          {/* Demo Mode Notice */}
          <div className={styles.demoNotice}>
            <span>⚠️</span>
            <span>Ordering is currently in demo mode. Please check back soon.</span>
          </div>
          <div className={styles.scrollArea}>
            {/* Items */}
            {items.map((item) => (
              <div key={item.product.id} className={styles.itemCard}>
                <div className={styles.itemIcon}>📦</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemPrice}>₹{parseFloat(item.product.price_per_unit).toFixed(2)}/{item.product.unit}</div>
                </div>
                <div className={styles.itemControls}>
                  <div className={styles.itemTotal}>₹{(item.product.price_per_unit * item.quantity).toFixed(2)}</div>
                  <div className={styles.qtyRow}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.product.id, item.quantity - 1)}>−</button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.product.id, item.quantity + 1)}>+</button>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.product.id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Delivery Address */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Delivery Address</div>
              <textarea
                className={styles.addressInput}
                placeholder="Enter full delivery address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Payment Method</div>
              {payMethods.map((pm) => (
                <div
                  key={pm.value}
                  className={`${styles.payMethod} ${paymentMethod === pm.value ? styles.payActive : ''}`}
                  onClick={() => setPaymentMethod(pm.value)}
                >
                  <span className={styles.payIcon}>{pm.icon}</span>
                  <span className={styles.payLabel}>{pm.label}</span>
                  {paymentMethod === pm.value && <span className={styles.payCheck}>✓</span>}
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Bill Summary</div>
              <div className={styles.billRow}>
                <div>
                  <div className={styles.billLabel}>Items Subtotal</div>
                  <div className={styles.billNote}>At SITA special prices</div>
                </div>
                <div className={styles.billValue}>₹{subtotal.toFixed(2)}</div>
              </div>
              <div className={styles.billRow}>
                <div>
                  <div className={styles.billLabel}>Foundation Fee (2%)</div>
                  <div className={styles.billNote} style={{ color: 'var(--error)' }}>2% of market value — non-refundable</div>
                </div>
                <div className={styles.billValue}>₹{foundationFee.toFixed(2)}</div>
              </div>
              <div className={styles.divider} />
              <div className={styles.billRow}>
                <div className={styles.billLabelBold}>Total Payable</div>
                <div className={styles.billValueBold}>₹{total.toFixed(2)}</div>
              </div>
            </div>

            {/* Terms */}
            <div
              className={`${styles.termsBox} ${accepted ? styles.termsAccepted : ''}`}
              onClick={() => setAccepted(!accepted)}
            >
              <span className={styles.checkbox}>{accepted ? '☑' : '☐'}</span>
              <p>I understand that the 2% Foundation Fee is non-refundable. Orders once placed cannot be cancelled without penalty as per SITA Foundation policy.</p>
            </div>

            <div style={{ height: 16 }} />
          </div>

          {/* Place Order */}
          <div className={styles.footer}>
            <button className={styles.placeBtn} disabled>
              Coming Soon  •  ₹{total.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
