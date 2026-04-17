import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate } from '../components/utils';

const statusBadge = (status) => {
  const map = {
    approved: { label: 'Approved', cls: 'badge-success' },
    pending:  { label: 'Pending',  cls: 'badge-warning' },
    blocked:  { label: 'Blocked',  cls: 'badge-danger'  },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${cls}`}>{label}</span>;
};

const emptyForm = { name: '', mobile: '', district: '', taluka: '' };

export default function SurveyAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/survey-agents', { params })
      .then(r => setAgents(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const action = async (id, type) => {
    setActionLoading(id + type);
    try {
      await api.post(`/admin/survey-agents/${id}/${type}`);
      setMsg({ type: 'success', text: `Agent ${type === 'unblock' ? 'unblocked' : type + 'd'} successfully` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || `Failed to ${type} agent` });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAgent = async (id, name) => {
    if (!window.confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
    setActionLoading(id + 'delete');
    try {
      await api.delete(`/admin/survey-agents/${id}`);
      setMsg({ type: 'success', text: 'Agent deleted' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to delete' });
    } finally {
      setActionLoading(null);
    }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Agent name is required');
    if (!/^\d{10}$/.test(form.mobile)) return setFormError('Enter a valid 10-digit mobile number');
    if (!form.district.trim()) return setFormError('District is required');
    setFormLoading(true);
    try {
      await api.post('/admin/survey-agents/add', form);
      setMsg({ type: 'success', text: `Agent "${form.name}" added successfully` });
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to add agent');
    } finally {
      setFormLoading(false);
    }
  };

  const counts = {
    total: agents.length,
    approved: agents.filter(a => a.status === 'approved').length,
    blocked: agents.filter(a => a.status === 'blocked').length,
  };

  return (
    <>
      {/* Add Agent Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#1a237e' }}>Add Survey Agent</h3>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); }}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <form onSubmit={submitAdd} style={{ padding: 24 }}>
              {formError && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                  {formError}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', marginBottom: 6, letterSpacing: 0.8 }}>
                  AGENT NAME *
                </label>
                <input
                  className="filter-select"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14 }}
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', marginBottom: 6, letterSpacing: 0.8 }}>
                  MOBILE NUMBER *
                </label>
                <input
                  className="filter-select"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14 }}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  value={form.mobile}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', marginBottom: 6, letterSpacing: 0.8 }}>
                    DISTRICT *
                  </label>
                  <input
                    className="filter-select"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14 }}
                    placeholder="e.g. Surat"
                    value={form.district}
                    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#757575', marginBottom: 6, letterSpacing: 0.8 }}>
                    TALUKA
                  </label>
                  <input
                    className="filter-select"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', fontSize: 14 }}
                    placeholder="e.g. Bardoli"
                    value={form.taluka}
                    onChange={e => setForm(f => ({ ...f, taluka: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => { setShowModal(false); setForm(emptyForm); setFormError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm"
                  style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 20px' }}
                  disabled={formLoading}>
                  {formLoading ? 'Adding…' : 'Add Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msg && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)}>
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Agents', value: counts.total,    color: '#3949ab' },
          { label: 'Active',       value: counts.approved, color: '#00897b' },
          { label: 'Blocked',      value: counts.blocked,  color: '#c62828' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3>Survey Agents ({counts.total})</h3>
          <button
            className="btn btn-sm"
            style={{ background: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            + Add Agent
          </button>
        </div>
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filters">
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Mobile</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Surveys</th>
                  <th>Last Survey</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                      No agents yet. Click <strong>+ Add Agent</strong> to register one.
                    </td>
                  </tr>
                ) : agents.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#e8eaf6', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: '#3949ab', fontSize: 14, flexShrink: 0
                        }}>
                          {(agent.name || agent.mobile).charAt(0).toUpperCase()}
                        </div>
                        <strong>{agent.name || '—'}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 14 }}>{agent.mobile}</td>
                    <td>{agent.district || '—'}{agent.taluka ? `, ${agent.taluka}` : ''}</td>
                    <td>{statusBadge(agent.status)}</td>
                    <td>{formatDate(agent.created_at)}</td>
                    <td><span style={{ fontWeight: 700, color: '#3949ab' }}>{agent.total_surveys || 0}</span></td>
                    <td style={{ color: '#888', fontSize: 13 }}>
                      {agent.last_survey_at ? formatDate(agent.last_survey_at) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {agent.status === 'approved' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#c62828', color: 'white', border: 'none' }}
                            disabled={actionLoading === agent.id + 'block'}
                            onClick={() => action(agent.id, 'block')}
                          >
                            {actionLoading === agent.id + 'block' ? '…' : 'Block'}
                          </button>
                        )}
                        {agent.status === 'blocked' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#00897b', color: 'white', border: 'none' }}
                            disabled={actionLoading === agent.id + 'unblock'}
                            onClick={() => action(agent.id, 'unblock')}
                          >
                            {actionLoading === agent.id + 'unblock' ? '…' : 'Unblock'}
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: '#c62828', borderColor: '#c62828', opacity: actionLoading === agent.id + 'delete' ? 0.5 : 1 }}
                          disabled={actionLoading === agent.id + 'delete'}
                          onClick={() => deleteAgent(agent.id, agent.name || agent.mobile)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
