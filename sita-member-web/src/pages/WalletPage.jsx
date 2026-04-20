import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../components/Toast';
import styles from './WalletPage.module.css';

function fmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function titleCase(str) {
  return (str || '').replace(/_/g, ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function WalletPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/members/wallet');
      setBalance(parseFloat(res.data.balance || res.data.wallet?.balance || 0));
      setTransactions(res.data.transactions || res.data.wallet?.transactions || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load wallet', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div className={styles.headerCenter}>
          <img src="/logo.png" alt="SITA" className={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className={styles.title}>SITA Wallet</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {/* Balance Card */}
        <div className={styles.balanceCard}>
          <div className={styles.walletIcon}>👛</div>
          <div className={styles.balanceLabel}>Available Balance</div>
          <div className={styles.balance}>₹{balance.toFixed(2)}</div>
          <div className={styles.balanceSub}>SITA Store Credit</div>
        </div>

        {/* Info Card */}
        <div className={styles.infoCard}>
          <InfoRow icon="ℹ️" text="SITA Wallet credits are issued by the Foundation as rewards or refunds." />
          <InfoRow icon="🛍️" text="Use wallet balance to pay for marketplace orders instantly." />
          <InfoRow icon="🔒" text="Credits are non-transferable and valid only within the platform." />
        </div>

        {/* Transaction History */}
        <div className={styles.txHeader}>
          <span className={styles.txTitle}>Transaction History</span>
          <span className={styles.txCount}>{transactions.length} records</span>
        </div>

        {loading ? (
          <div className={styles.center}><div className={styles.spinner} /></div>
        ) : transactions.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🧾</span>
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className={styles.txList}>
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div key={tx.id} className={styles.txCard}>
                  <div className={`${styles.txIcon} ${isCredit ? styles.txCredit : styles.txDebit}`}>
                    <span>{isCredit ? '↓' : '↑'}</span>
                  </div>
                  <div className={styles.txInfo}>
                    <div className={styles.txDesc}>{tx.description || titleCase(tx.reason)}</div>
                    <div className={styles.txDate}>{fmtDate(tx.created_at)}</div>
                    <div className={styles.txBalance}>Balance: ₹{parseFloat(tx.balance_after || 0).toFixed(2)}</div>
                  </div>
                  <div className={`${styles.txAmount} ${isCredit ? styles.amtCredit : styles.amtDebit}`}>
                    {isCredit ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
