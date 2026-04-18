import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { statusBadge, formatCurrency, formatDate } from '../components/utils';

// ─── Pure-SVG bar chart ────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) return null;

  const W = 700, H = 220, PAD = { top: 16, right: 16, bottom: 48, left: 72 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const barGroupW = innerW / data.length;
  const barW = Math.min(barGroupW * 0.22, 18);
  const gap = 3;

  const monthLabel = (m) => {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1, 1).toLocaleString('default', { month: 'short' });
  };

  const yTicks = 4;
  const colors = { membership: '#1A237E', commission: '#059669', cancellation: '#F97316' };

  const fmt = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
        {/* Y-axis grid + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = (maxVal / yTicks) * i;
          const y = PAD.top + innerH - (i / yTicks) * innerH;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={PAD.left + innerW} y1={y} y2={y}
                stroke="#f3f4f6" strokeWidth={i === 0 ? 1.5 : 1} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                fontSize="10" fill="#9ca3af">{fmt(val)}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupX = PAD.left + i * barGroupW + barGroupW / 2;
          const bars = [
            { key: 'membership', val: d.membership, color: colors.membership },
            { key: 'commission', val: d.commission, color: colors.commission },
            { key: 'cancellation', val: d.cancellation, color: colors.cancellation },
          ];
          const totalBarsW = bars.length * barW + (bars.length - 1) * gap;
          return (
            <g key={d.month}>
              {bars.map((b, j) => {
                const bx = groupX - totalBarsW / 2 + j * (barW + gap);
                const bh = Math.max((b.val / maxVal) * innerH, b.val > 0 ? 2 : 0);
                const by = PAD.top + innerH - bh;
                return (
                  <g key={b.key}>
                    <rect x={bx} y={by} width={barW} height={bh}
                      fill={b.color} rx={3} opacity={0.85}>
                      <title>{b.key}: {fmt(b.val)}</title>
                    </rect>
                  </g>
                );
              })}
              {/* X label */}
              <text x={groupX} y={H - 10} textAnchor="middle"
                fontSize="11" fill="#6b7280">{monthLabel(d.month)}</text>
            </g>
          );
        })}

        {/* X axis baseline */}
        <line x1={PAD.left} x2={PAD.left + innerW}
          y1={PAD.top + innerH} y2={PAD.top + innerH}
          stroke="#e5e7eb" strokeWidth={1.5} />
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
        {[
          { color: colors.membership,   label: 'Membership Fees' },
          { color: colors.commission,   label: '2% Commission' },
          { color: colors.cancellation, label: 'Cancellation Charges' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue breakdown card ────────────────────────────────────────────────────
function RevenueCard({ title, amount, sub, icon, accentColor, bgColor }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0,
      background: '#fff',
      border: `1.5px solid ${accentColor}22`,
      borderRadius: 14,
      padding: '20px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accentColor, letterSpacing: '-0.5px' }}>
        {formatCurrency(amount)}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.get('/admin/dashboard/stats')
      .then(r => {
        setStats(r.data);
        setRecentOrders(r.data.recent_orders || r.data.stats?.recent_orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      setRecentOrders(prev => prev.filter(o => o.id !== id));
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete order'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!stats) return <div className="alert alert-error">Failed to load dashboard</div>;

  const { members, vendors, orders, disputes, revenue, memberships, monthly_trend } = stats.stats || stats;

  const membershipRev   = parseFloat(revenue?.membership_revenue   || 0);
  const commissionRev   = parseFloat(revenue?.commission_revenue   || 0);
  const cancellationRev = parseFloat(revenue?.cancellation_revenue || 0);
  const totalRev        = parseFloat(revenue?.total_revenue        || membershipRev + commissionRev + cancellationRev);

  return (
    <>
      {/* ── Top stats grid ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f0fe' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#1a56db"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Total Members</div>
            <div className="stat-value">{members?.total || 0}</div>
            <div className="stat-sub">{members?.active || 0} active · {members?.pending || 0} pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#def7ec' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#057a55"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <div className="stat-label">Vendors</div>
            <div className="stat-value">{vendors?.total || 0}</div>
            <div className="stat-sub">{vendors?.active || 0} active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf6b2' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c27803"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders?.total || 0}</div>
            <div className="stat-sub">{orders?.pending || 0} pending · {orders?.delivered || 0} delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fde8e8' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c81e1e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <div className="stat-label">Open Disputes</div>
            <div className="stat-value">{disputes?.open || 0}</div>
            <div className="stat-sub">Requires attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#e65100"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Expiring This Month</div>
            <div className="stat-value" style={{ color: '#e65100' }}>{memberships?.expiring_this_month || 0}</div>
            <div className="stat-sub">Annual memberships</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fde8e8' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#c81e1e"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <div className="stat-label">Expired Memberships</div>
            <div className="stat-value" style={{ color: '#c81e1e' }}>{memberships?.expired || 0}</div>
            <div className="stat-sub">Need renewal</div>
          </div>
        </div>
      </div>

      {/* ── Revenue Overview ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>Revenue Overview</h3>
        </div>
        <div className="card-body">

          {/* Total Revenue banner */}
          <div style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            borderRadius: 14,
            padding: '24px 28px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Total Revenue (All Sources)
              </div>
              <div style={{ color: '#fff', fontSize: 42, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
                {formatCurrency(totalRev)}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '12px 20px',
              display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160,
            }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Membership + Commission + Penalties</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {formatCurrency(membershipRev)} + {formatCurrency(commissionRev)} + {formatCurrency(cancellationRev)}
              </div>
            </div>
          </div>

          {/* 3 Breakdown Cards */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <RevenueCard
              title="Membership Fees"
              amount={membershipRev}
              sub={`${revenue?.membership_paid_count || 0} verified members`}
              accentColor="#1A237E"
              bgColor="#E8F0FE"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1A237E">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            />
            <RevenueCard
              title="2% Commission"
              amount={commissionRev}
              sub={`${orders?.delivered || 0} delivered orders`}
              accentColor="#059669"
              bgColor="#D1FAE5"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#059669">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <RevenueCard
              title="Cancellation Charges"
              amount={cancellationRev}
              sub={`${revenue?.cancellation_count || orders?.cancelled || 0} cancellations`}
              accentColor="#EA580C"
              bgColor="#FFEDD5"
              icon={
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#EA580C">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Monthly Trend Chart */}
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 14 }}>
              Monthly Revenue Trend (Last 6 Months)
            </div>
            <RevenueChart data={monthly_trend} />
          </div>

        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Member / Hotel</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No orders yet</td></tr>
              )}
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>
                    <div>{o.member?.name}</div>
                    <div className="text-muted">{o.member?.hotel_name}</div>
                  </td>
                  <td>{o.vendor?.company_name}</td>
                  <td>{formatCurrency(o.total_amount)}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td className="text-muted">{formatDate(o.created_at)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
