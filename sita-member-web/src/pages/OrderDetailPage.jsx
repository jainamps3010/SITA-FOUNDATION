import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import StatusBadge from '../components/StatusBadge';
import styles from './OrderDetailPage.module.css';

function fmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelInfo, setCancelInfo] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        toast(err.response?.data?.message || 'Failed to load order', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const openCancel = async () => {
    let cancelCount = 0;
    try {
      const res = await api.get('/members/cancellation-count');
      cancelCount = res.data.count || 0;
    } catch {}
    const penalty = (order?.items || []).reduce((s, item) => {
      const market = item.market_price ?? item.unit_price;
      const diff = market - item.unit_price;
      return s + (diff > 0 ? diff * item.quantity : 0);
    }, 0);
    setCancelInfo({ cancelCount, penalty, refund: (order?.total_amount || 0) - penalty });
    setShowCancelDialog(true);
  };

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${id}/cancel`, {});
      const refund = res.data.refund || 0;
      const penalty = res.data.penalty || 0;
      setShowCancelDialog(false);
      navigate('/orders');
      const msg = penalty > 0
        ? `Cancelled. ₹${parseFloat(refund).toFixed(2)} credited after ₹${parseFloat(penalty).toFixed(2)} penalty.`
        : `Cancelled. ₹${parseFloat(refund).toFixed(2)} credited to your SITA Wallet.`;
      toast(msg, 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
          <span className={styles.title}>Order Detail</span>
          <div style={{ width: 40 }} />
        </div>
        <div className={styles.center}><div className={styles.spinner} /></div>
      </div>
    );
  }

  const activeIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['cancelled', 'disputed'].includes(order.status);
  const isFree = cancelInfo?.cancelCount === 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>{order.order_number}</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {/* Status Tracker */}
        <div className={styles.card}>
          <div className={styles.statusHeader}>
            <span className={styles.cardTitle}>Order Status</span>
            <StatusBadge status={order.status} />
          </div>
          {!isCancelled && (
            <div className={styles.tracker}>
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className={styles.step}>
                    <div className={`${styles.dot} ${i <= activeIdx ? styles.dotDone : ''}`}>
                      {i <= activeIdx && '✓'}
                    </div>
                    <span className={`${styles.stepLabel} ${i <= activeIdx ? styles.stepActive : ''}`}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`${styles.line} ${i < activeIdx ? styles.lineDone : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Cancel Button */}
        {['pending', 'confirmed'].includes(order.status) && (
          <button className={styles.cancelBtn} onClick={openCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : '✕ Cancel Order'}
          </button>
        )}

        {/* Order Info */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Order Information</div>
          <InfoRow label="Order Number" value={order.order_number} />
          <InfoRow label="Date" value={fmtDate(order.created_at)} />
          <InfoRow label="Payment" value={(order.payment_method || '').replace(/_/g, ' ')} />
          <InfoRow label="Payment Status" value={order.payment_status || ''} />
        </div>

        {/* Vendor */}
        {order.vendor && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Vendor</div>
            <InfoRow label="Company" value={order.vendor.company_name} />
            {order.vendor.phone && <InfoRow label="Phone" value={order.vendor.phone} />}
          </div>
        )}

        {/* Delivery Address */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Delivery Address</div>
          <p className={styles.address}>{order.delivery_address}</p>
        </div>

        {/* Order Items */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Order Items</div>
          {(order.items || []).map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.itemLeft}>
                <div className={styles.itemName}>{item.product_name}</div>
                <div className={styles.itemDetail}>{item.quantity} {item.product_unit} × ₹{parseFloat(item.unit_price).toFixed(2)}</div>
              </div>
              <div className={styles.itemTotal}>₹{parseFloat(item.total_price).toFixed(2)}</div>
            </div>
          ))}
          <div className={styles.divider} />
          <BillRow label="Subtotal" value={`₹${(parseFloat(order.total_amount || 0) - parseFloat(order.sita_commission || 0)).toFixed(2)}`} />
          <BillRow label="Foundation Fee (2%)" value={`₹${parseFloat(order.sita_commission || 0).toFixed(2)}`} note="Non-refundable" />
          <div className={styles.divider} />
          <BillRow label="Total" value={`₹${parseFloat(order.total_amount || 0).toFixed(2)}`} bold />
        </div>

        <div style={{ height: 24 }} />
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && cancelInfo && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3 style={{ marginBottom: 8 }}>{isFree ? 'Cancel Order?' : 'Cancel Order — Penalty Applicable'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>Order {order.order_number}</p>
            {isFree ? (
              <>
                <div className={styles.infoBox} style={{ background: '#E8F5E9', borderColor: '#A5D6A7' }}>
                  <div style={{ color: '#2E7D32', fontWeight: 700, marginBottom: 6 }}>✓ This is your FREE cancellation.</div>
                  <div style={{ color: '#2E7D32', fontSize: 13 }}>Full refund will be credited to your SITA Wallet.</div>
                </div>
                <div className={styles.infoBox} style={{ background: '#FFF8E1', borderColor: '#FFE082', marginTop: 8 }}>
                  <div style={{ color: '#E65100', fontSize: 12, lineHeight: 1.4 }}>
                    ⚠️ Warning: Future cancellations will incur a penalty equal to the difference between Market Price and SITA Special Price.
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.infoBox} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
                <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 8 }}>✕ Your free cancellation has been used.</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>Penalty Amount</span>
                  <span style={{ color: 'var(--error)', fontWeight: 700 }}>₹{parseFloat(cancelInfo.penalty).toFixed(2)}</span>
                </div>
                <div style={{ color: '#E57373', fontSize: 11, marginBottom: 8 }}>(Difference between Market Price and SITA Price)</div>
                <div style={{ height: 1, background: '#FFCDD2', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13 }}>Refund to Wallet</span>
                  <span style={{ color: '#2E7D32', fontWeight: 700 }}>₹{parseFloat(cancelInfo.refund).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className={styles.dialogActions}>
              <button className={styles.dialogKeep} onClick={() => setShowCancelDialog(false)}>Keep Order</button>
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

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--divider)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 13, textAlign: 'right', maxWidth: '60%', textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}

function BillRow({ label, value, bold, note }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px 0' }}>
      <div>
        <div style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</div>
        {note && <div style={{ fontSize: 10, color: 'var(--error)' }}>{note}</div>}
      </div>
      <div style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 500, color: bold ? 'var(--primary)' : 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
