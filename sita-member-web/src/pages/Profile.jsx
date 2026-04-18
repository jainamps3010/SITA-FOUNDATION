import React, { useState, useEffect } from 'react';
import { MdPerson, MdBusiness, MdVerifiedUser, MdEdit, MdSave, MdClose, MdCheck, MdSchedule } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.get('/members/profile').then((res) => {
      setProfile(res.data?.member || res.data);
    }).catch(() => setProfile(user)).finally(() => setLoading(false));
  }, [user]);

  const data = profile || user || {};

  const startEdit = (section, fields) => {
    setEditSection(section);
    setForm(fields);
    setSaveMsg('');
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const res = await api.put('/members/profile', form);
      const updated = res.data?.member || res.data;
      setProfile(updated);
      login(updated, token);
      setSaveMsg('Profile updated successfully!');
      setEditSection(null);
    } catch (err) {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, key, type = 'text') => (
    <div key={key} style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {editSection ? (
        <input
          className="form-input"
          style={{ maxWidth: 280, padding: '7px 12px' }}
          type={type}
          value={form[key] || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        />
      ) : (
        <span style={styles.fieldVal}>{data[key] || '—'}</span>
      )}
    </div>
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={styles.grid}>
      {/* Member Details */}
      <div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={styles.cardTop}>
            <div className="card-title" style={{ marginBottom: 0 }}><MdPerson /> Member Details</div>
            {editSection !== 'member' ? (
              <button className="btn btn-outline btn-sm" onClick={() => startEdit('member', { name: data.name, email: data.email, mobile: data.mobile, address: data.address })}>
                <MdEdit /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><MdSave /> {saving ? '...' : 'Save'}</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditSection(null)}><MdClose /></button>
              </div>
            )}
          </div>

          {saveMsg && <div className={`alert ${saveMsg.includes('success') ? 'alert-success' : 'alert-danger'}`} style={{ margin: '12px 0' }}>{saveMsg}</div>}

          {/* Avatar */}
          <div style={styles.avatar}>
            <div style={styles.avatarCircle}>{data.name?.charAt(0).toUpperCase() || 'M'}</div>
            <div>
              <p style={styles.avatarName}>{data.name || 'Member'}</p>
              <p style={styles.avatarId}>ID: {data.member_id || String(data.id || '').slice(-8).toUpperCase() || '—'}</p>
            </div>
          </div>

          <div style={styles.fields}>
            {editSection === 'member' ? (
              <>
                {renderField('Full Name', 'name')}
                {renderField('Email', 'email', 'email')}
                {renderField('Mobile', 'mobile', 'tel')}
                {renderField('Address', 'address')}
              </>
            ) : (
              <>
                {[['Full Name', data.name], ['Mobile', data.phone || data.mobile], ['Email', data.email], ['Hotel / Business', data.hotel_name], ['Address', data.hotel_address || data.address], ['City', data.city]].map(([label, val]) => (
                  <div key={label} style={styles.field}>
                    <span style={styles.fieldLabel}>{label}</span>
                    <span style={styles.fieldVal}>{val || '—'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div className="card">
          <div style={styles.cardTop}>
            <div className="card-title" style={{ marginBottom: 0 }}><MdBusiness /> Business Information</div>
            {editSection !== 'business' ? (
              <button className="btn btn-outline btn-sm" onClick={() => startEdit('business', { business_name: data.business_name, gst_number: data.gst_number, business_type: data.business_type, business_address: data.business_address })}>
                <MdEdit /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}><MdSave /> {saving ? '...' : 'Save'}</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditSection(null)}><MdClose /></button>
              </div>
            )}
          </div>

          <div style={styles.fields}>
            {editSection === 'business' ? (
              <>
                {renderField('Business Name', 'business_name')}
                {renderField('GST Number', 'gst_number')}
                {renderField('Business Type', 'business_type')}
                {renderField('Business Address', 'business_address')}
              </>
            ) : (
              <>
                {[['Business Name', data.business_name], ['GST Number', data.gst_number], ['Business Type', data.business_type], ['Business Address', data.business_address]].map(([label, val]) => (
                  <div key={label} style={styles.field}>
                    <span style={styles.fieldLabel}>{label}</span>
                    <span style={styles.fieldVal}>{val || '—'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KYC Documents */}
      <div>
        <div className="card">
          <div className="card-title"><MdVerifiedUser /> KYC Documents</div>

          <div style={styles.kycStatus}>
            <div style={styles.kycBadge(data.kyc_status)}>
              {data.kyc_status === 'verified' ? <MdCheck /> : <MdSchedule />}
              {data.kyc_status === 'verified' ? 'KYC Verified' : data.kyc_status === 'pending' ? 'KYC Pending Review' : 'KYC Not Submitted'}
            </div>
          </div>

          {[
            { label: 'Aadhaar Card', key: 'aadhaar_url', icon: '🪪' },
            { label: 'PAN Card', key: 'pan_url', icon: '💳' },
            { label: 'Business License', key: 'business_license_url', icon: '📄' },
            { label: 'Bank Passbook', key: 'passbook_url', icon: '🏦' },
          ].map(({ label, key, icon }) => (
            <div key={key} style={styles.kycDoc}>
              <span style={styles.kycIcon}>{icon}</span>
              <div style={{ flex: 1 }}>
                <p style={styles.kycLabel}>{label}</p>
                <p style={styles.kycVal}>{data[key] ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
              <span className={`badge badge-${data[key] ? 'success' : 'secondary'}`}>
                {data[key] ? <><MdCheck /> Done</> : 'Pending'}
              </span>
            </div>
          ))}

          <div className="alert alert-info" style={{ marginTop: 16 }}>
            <MdVerifiedUser />
            To update KYC documents, please contact the SITA Foundation office directly.
          </div>
        </div>

        {/* Account Info */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title"><MdPerson /> Account Information</div>
          <div style={styles.fields}>
            {[
              ['Member Since', data.created_at ? new Date(data.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null],
              ['Membership Plan', data.membership_plan || 'Annual'],
              ['Status', data.status || 'Active'],
            ].map(([label, val]) => (
              <div key={label} style={styles.field}>
                <span style={styles.fieldLabel}>{label}</span>
                <span style={styles.fieldVal}>{val || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatar: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F0F0F0' },
  avatarCircle: {
    width: 60, height: 60, borderRadius: '50%',
    background: '#1A237E', color: '#FF8F00',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem', fontWeight: 800, flexShrink: 0,
  },
  avatarName: { fontWeight: 700, fontSize: '1.05rem', color: '#212121', marginBottom: 3 },
  avatarId: { fontSize: '0.8rem', color: '#9E9E9E' },
  fields: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F5F5F5', gap: 12 },
  fieldLabel: { fontSize: '0.85rem', color: '#757575', flexShrink: 0 },
  fieldVal: { fontSize: '0.9rem', fontWeight: 600, color: '#212121', textAlign: 'right' },
  kycStatus: { marginBottom: 16 },
  kycBadge: (status) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: '0.875rem',
    background: status === 'verified' ? '#E8F5E9' : '#FFF8E1',
    color: status === 'verified' ? '#2E7D32' : '#F57F17',
  }),
  kycDoc: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F5' },
  kycIcon: { fontSize: '1.5rem', width: 36, textAlign: 'center' },
  kycLabel: { fontSize: '0.875rem', fontWeight: 600, color: '#212121', marginBottom: 2 },
  kycVal: { fontSize: '0.78rem', color: '#9E9E9E' },
};
