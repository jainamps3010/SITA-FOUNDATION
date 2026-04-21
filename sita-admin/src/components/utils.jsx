import React from 'react';

export const statusBadge = (status) => {
  const map = {
    active: 'badge-success', pending: 'badge-warning',
    rejected: 'badge-danger', suspended: 'badge-danger',
    delivered: 'badge-success', confirmed: 'badge-info',
    dispatched: 'badge-info', cancelled: 'badge-danger',
    disputed: 'badge-danger', open: 'badge-danger',
    investigating: 'badge-warning', resolved: 'badge-success', reviewed: 'badge-info',
    paid: 'badge-success', refunded: 'badge-info',
    expired: 'badge-gray'
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace('_', ' ')}</span>;
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const Pagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>←</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1;
        return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>;
      })}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === pages}>→</button>
      <span className="text-muted" style={{ marginLeft: '8px' }}>Page {page} of {pages}</span>
    </div>
  );
};
