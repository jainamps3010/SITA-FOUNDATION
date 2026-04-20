import React from 'react';

const colorMap = {
  active: { bg: '#E8F5E9', color: '#2E7D32' },
  pending: { bg: '#FFF8E1', color: '#E65100' },
  confirmed: { bg: '#E3F2FD', color: '#1565C0' },
  dispatched: { bg: '#F3E5F5', color: '#6A1B9A' },
  delivered: { bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
  expired: { bg: '#FFEBEE', color: '#C62828' },
  approved: { bg: '#E8F5E9', color: '#2E7D32' },
  disputed: { bg: '#FFF3E0', color: '#E65100' },
};

export default function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const style = colorMap[s] || { bg: '#F5F5F5', color: '#757575' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
