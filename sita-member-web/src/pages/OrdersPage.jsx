import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import styles from './OrdersPage.module.css';

const STATUSES = ['All', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

function fmtDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async (status = selectedStatus) => {
    setLoading(true);
    try {
      let path = '/members/orders?limit=50';
      if (status) path += `&status=${status}`;
      const res = await api.get(path);
      setOrders(res.data.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, toast]);

  useEffect(() => { fetchOrders(''); }, []);

  const filterStatus = (s) => {
    const val = s === 'All' ? '' : s;
    setSelectedStatus(val);
    fetchOrders(val);
  };

  const showCancelDialog = async (order) => {
    let cancelCount = 0;
    try {
      const res = await api.get('/members/cancellation-count');
      cancelCount = res.data.count || 0;
    } catch {
      cancelCount = orders.filter((o) => o.status === 'cancelled').length;
    }
    const penalty = order.items?.reduce((s, item) => {
      const market = item.market_price ?? item.unit_price;
      const diff = market - item.unit_price;
      return s + (diff > 0 ? diff * item.quantity : 0);
    }, 0) || 0;
    setCancelInfo({ cancelCount, penalty, refund: (order.total_amount || 0) - penalty });
    setCancelTarget(order);
  };

  const cancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${cancelTarget.id}/cancel`, {});
      const refund = res.data.refund || 0;
      const penalty = res.data.penalty || 0;
      setCancelTarget(null);
      setCancelInfo(null);
      fetchOrders(selectedStatus);
      const msg = penalty > 0
        ? `Order cancelled. ₹${parseFloat(refund).toFixed(2)} credited after ₹${parseFloat(penalty).toFixed(2)} penalty.`
        : `Order cancelled. ₹${parseFloat(refund).toFixed(2)} credited to your SITA Wallet.`;
      toast(msg, 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const isFree = cancelInfo?.cancelCount === 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>My Orders</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Status Filters */}
      <div className={styles.filterScroll}>
        {STATUSES.map((s) => {
          const val = s === 'All' ? '' : s;
          const active = selectedStatus === val;
          return (
            <button
              key={s}
              className={`${styles.filterChip} ${active ? styles.filterActive : ''}`}
              onClick={() => filterStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.center}><div className={styles.spinner} /></div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No orders found.</p>
            <p>Start ordering from the marketplace.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard} onClick={() => navigate(`/orders/${order.id}`, { state: { order } })}>
                <div className={styles.orderTop}>
                  <span className={styles.orderNum}>{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                {order.vendor?.company_name && (
                  <div className={styles.vendorName}>{order.vendor.company_name}</div>
                )}
                <div className={styles.orderDate}>🕐 {fmtDate(order.created_at)}</div>
                <div className={styles.divider} />
                <div className={styles.orderBottom}>
                  <div>
                    <div className={styles.itemCount}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</div>
                    <div className={styles.itemNames}>
                      {(order.items || []).slice(0, 2).map((i) => i.product_name).join(', ')}
                      {(order.items?.length || 0) > 2 && ` +${order.items.length - 2} more`}
                    </div>
                  </div>
                  <span className={styles.orderTotal}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                </div>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    className={styles.cancelBtn}
                    onClick={(e) => { e.stopPropagation(); showCancelDialog(order); }}
                  >
                    ✕ Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      {cancelTarget && cancelInfo && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3 style={{ marginBottom: 8 }}>{isFree ? 'Cancel Order?' : 'Cancel Order — Penalty Applicable'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Order {cancelTarget.order_number}</p>
            {isFree ? (
              <>
                <div className={styles.infoBox} style={{ background: '#E8F5E9', borderColor: '#A5D6A7' }}>
                  <div style={{ color: '#2E7D32', fontWeight: 700, marginBottom: 6 }}>✓ This is your FREE cancellation.</div>
                  <div style={{ color: '#2E7D32', fontSize: 13 }}>Full refund will be credited to your SITA Wallet.</div>
                </div>
                <div className={styles.infoBox} style={{ background: '#FFF8E1', borderColor: '#FFE082', marginTop: 8 }}>
                  <div style={{ color: '#E65100', fontSize: 12, lineHeight: 1.4 }}>
                    ⚠️ Warning: After this, all future cancellations will be charged a penalty equal to the difference between Market Price and SITA Special Price.
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.infoBox} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
                <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 8 }}>✕ Your free cancellation has been used.</div>
                <div className={styles.penaltyRow}>
                  <span style={{ fontSize: 13 }}>Penalty Amount</span>
                  <span style={{ color: 'var(--error)', fontWeight: 700 }}>₹{parseFloat(cancelInfo.penalty).toFixed(2)}</span>
                </div>
                <div style={{ color: '#E57373', fontSize: 11, marginBottom: 8 }}>(Difference between Market Price and SITA Price)</div>
                <div style={{ height: 1, background: '#FFCDD2', margin: '8px 0' }} />
                <div className={styles.penaltyRow}>
                  <span style={{ fontSize: 13 }}>Refund to Wallet</span>
                  <span style={{ color: '#2E7D32', fontWeight: 700 }}>₹{parseFloat(cancelInfo.refund).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className={styles.dialogActions}>
              <button className={styles.dialogKeep} onClick={() => { setCancelTarget(null); setCancelInfo(null); }}>Keep Order</button>
              <button className={styles.dialogCancel} onClick={cancelOrder} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : isFree ? 'Cancel for Free' : 'Cancel with Penalty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
