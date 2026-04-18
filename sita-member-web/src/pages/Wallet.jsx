import React, { useState, useEffect } from 'react';
import { MdAccountBalanceWallet, MdArrowUpward, MdArrowDownward, MdRefresh } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Wallet() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const balance = walletBalance ?? user?.sita_wallet_balance ?? user?.wallet_balance ?? 0;

  const fetchTransactions = () => {
    setLoading(true);
    // Try member wallet endpoint first, fall back to wallet transactions
    api.get('/members/wallet')
      .catch(() => api.get('/wallet/transactions'))
      .then((res) => {
        const data = res.data?.transactions || res.data?.wallet?.transactions || res.data || [];
        if (res.data?.wallet?.balance !== undefined) {
          setWalletBalance(res.data.wallet.balance);
        }
        setTransactions(Array.isArray(data) ? data : []);
      }).catch(() => setTransactions([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  const totalCredit = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceLeft}>
          <p style={styles.balanceLabel}>Current Balance</p>
          <h2 style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</h2>
          <p style={styles.balanceSub}>SITA Foundation Wallet</p>
        </div>
        <div style={styles.balanceRight}>
          <MdAccountBalanceWallet style={{ fontSize: '4rem', opacity: 0.25 }} />
        </div>
      </div>

      {/* Mini Stats */}
      <div style={styles.miniStats}>
        <div style={styles.miniCard}>
          <div style={{ ...styles.miniIcon, background: '#E8F5E9' }}>
            <MdArrowDownward style={{ color: '#2E7D32', fontSize: '1.2rem' }} />
          </div>
          <div>
            <p style={styles.miniLabel}>Total Credited</p>
            <p style={styles.miniVal}>₹{totalCredit.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div style={styles.miniCard}>
          <div style={{ ...styles.miniIcon, background: '#FFEBEE' }}>
            <MdArrowUpward style={{ color: '#C62828', fontSize: '1.2rem' }} />
          </div>
          <div>
            <p style={styles.miniLabel}>Total Debited</p>
            <p style={styles.miniVal}>₹{totalDebit.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Transaction History</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-input" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={fetchTransactions}><MdRefresh /></button>
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9E9E9E' }}>
            <MdAccountBalanceWallet style={{ fontSize: '2.5rem', color: '#BDBDBD' }} />
            <p style={{ marginTop: 8 }}>No transactions found.</p>
          </div>
        ) : (
          <div style={styles.txList}>
            {filtered.map((tx, i) => (
              <div key={tx._id || i} style={styles.txRow}>
                <div style={{ ...styles.txIcon, background: tx.type === 'credit' ? '#E8F5E9' : '#FFEBEE' }}>
                  {tx.type === 'credit'
                    ? <MdArrowDownward style={{ color: '#2E7D32', fontSize: '1.1rem' }} />
                    : <MdArrowUpward style={{ color: '#C62828', fontSize: '1.1rem' }} />}
                </div>
                <div style={styles.txDetails}>
                  <p style={styles.txDesc}>{tx.description || tx.note || (tx.type === 'credit' ? 'Wallet Credit' : 'Wallet Debit')}</p>
                  <p style={styles.txDate}>
                    {tx.reference && <span style={styles.txRef}>#{tx.reference}</span>}
                    {new Date(tx.created_at || tx.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={styles.txAmount(tx.type)}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  balanceCard: {
    background: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
    borderRadius: 14, padding: '28px 32px', color: '#fff',
    marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 4px 20px rgba(26,35,126,0.25)',
  },
  balanceLeft: {},
  balanceLabel: { fontSize: '0.875rem', opacity: 0.8, marginBottom: 6 },
  balanceAmount: { fontSize: '2.2rem', fontWeight: 900, marginBottom: 4 },
  balanceSub: { fontSize: '0.8rem', opacity: 0.65 },
  balanceRight: { color: '#fff' },
  miniStats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  miniCard: { background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 8px rgba(26,35,126,0.08)', display: 'flex', gap: 14, alignItems: 'center' },
  miniIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniLabel: { fontSize: '0.78rem', color: '#9E9E9E', marginBottom: 3 },
  miniVal: { fontSize: '1.1rem', fontWeight: 800, color: '#212121' },
  txList: { display: 'flex', flexDirection: 'column', gap: 4 },
  txRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderBottom: '1px solid #F5F5F5' },
  txIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txDetails: { flex: 1, minWidth: 0 },
  txDesc: { fontSize: '0.9rem', fontWeight: 600, color: '#212121', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  txDate: { fontSize: '0.78rem', color: '#9E9E9E', display: 'flex', alignItems: 'center', gap: 8 },
  txRef: { background: '#F5F5F5', padding: '2px 6px', borderRadius: 4, fontSize: '0.72rem', color: '#757575' },
  txAmount: (type) => ({ fontSize: '1rem', fontWeight: 800, color: type === 'credit' ? '#2E7D32' : '#C62828', whiteSpace: 'nowrap' }),
};
