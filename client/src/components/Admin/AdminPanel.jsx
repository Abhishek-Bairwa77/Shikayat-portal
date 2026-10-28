import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './AdminPanel.css';

const statusOptions = ['submitted', 'in-review', 'in-progress', 'resolved'];

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [confidential, setConfidential] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, confRes, statsRes] = await Promise.all([
        adminAPI.getAllGrievances(),
        adminAPI.getConfidential(),
        adminAPI.getStats()
      ]);
      setGrievances(allRes.data.grievances);
      setConfidential(confRes.data.grievances);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectGrievance = (g) => {
    setSelectedGrievance(g);
    setUpdateForm({ status: g.status, remarks: g.officialRemarks || '' });
  };

  const handleStatusUpdate = async () => {
    if (!selectedGrievance) return;
    setSaving(true);
    try {
      await adminAPI.updateStatus(selectedGrievance._id, {
        status: updateForm.status,
        remarks: updateForm.remarks
      });
      showToast('Grievance updated successfully!');
      setSelectedGrievance(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayed = activeTab === 'confidential' ? confidential : grievances;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span>🎓</span>
          <h1>SHIKAYAT</h1>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTab('all'); setSelectedGrievance(null); }}
          >
            <span>📋</span> All Grievances
          </button>
          <button
            className={`nav-item ${activeTab === 'confidential' ? 'active' : ''}`}
            onClick={() => { setActiveTab('confidential'); setSelectedGrievance(null); }}
          >
            <span>🔒</span> Confidential
            {confidential.length > 0 && <span className="badge-count">{confidential.length}</span>}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h2>{activeTab === 'confidential' ? '🔒 Confidential Grievances' : '📋 All Grievances'}</h2>
            <p>Welcome, {user?.username} • {user?.role === 'faculty' ? 'Faculty' : 'Administrator'}</p>
          </div>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </header>

        {stats && (
          <div className="admin-stats">
            <div className="stat-box">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-name">Total</span>
            </div>
            <div className="stat-box stat-conf">
              <span className="stat-value">{stats.confidential}</span>
              <span className="stat-name">Confidential</span>
            </div>
            <div className="stat-box stat-escalated">
              <span className="stat-value">{stats.escalated}</span>
              <span className="stat-name">Escalated</span>
            </div>
            <div className="stat-box stat-resolved">
              <span className="stat-value">{stats.resolved}</span>
              <span className="stat-name">Resolved</span>
            </div>
            <div className="stat-box stat-pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-name">Pending</span>
            </div>
          </div>
        )}

        <div className="admin-body">
          {/* List */}
          <div className="grievance-list-panel">
            {loading ? (
              <div className="admin-loading">Loading...</div>
            ) : displayed.length === 0 ? (
              <div className="admin-empty">No grievances in this category</div>
            ) : (
              <div className="grievance-list">
                {displayed.map((g) => (
                  <div
                    key={g._id}
                    className={`grievance-list-item ${selectedGrievance?._id === g._id ? 'selected' : ''}`}
                    onClick={() => handleSelectGrievance(g)}
                  >
                    <div className="item-header">
                      <span className={`item-status status-${g.status}`}>
                        {g.status.replace('-', ' ')}
                      </span>
                      {g.isHighPriority && <span className="item-priority">🔥</span>}
                      {g.isConfidential && <span className="item-conf">🔒</span>}
                    </div>
                    <h4 className="item-title">{g.title}</h4>
                    <div className="item-meta">
                      <span>{g.department}</span>
                      <span>•</span>
                      <span>{g.voteCount} votes</span>
                      {g.reportedBy && (
                        <>
                          <span>•</span>
                          <span>{g.reportedBy.rollNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="grievance-detail-panel">
            {selectedGrievance ? (
              <div className="detail-content">
                <div className="detail-header">
                  <h3>{selectedGrievance.title}</h3>
                  {selectedGrievance.isConfidential && (
                    <span className="conf-badge">🔒 Confidential</span>
                  )}
                </div>

                <div className="detail-meta-grid">
                  <div><strong>Department:</strong> {selectedGrievance.department}</div>
                  <div><strong>Category:</strong> {selectedGrievance.category}</div>
                  <div><strong>Votes:</strong> {selectedGrievance.voteCount}</div>
                  <div><strong>Status:</strong> {selectedGrievance.status}</div>
                  {selectedGrievance.reportedBy && (
                    <div><strong>Reporter:</strong> {selectedGrievance.reportedBy.rollNumber} ({selectedGrievance.reportedBy.department})</div>
                  )}
                  <div><strong>Submitted:</strong> {new Date(selectedGrievance.createdAt).toLocaleString()}</div>
                </div>

                <div className="detail-description">
                  <strong>Description:</strong>
                  <p>{selectedGrievance.description}</p>
                </div>

                {selectedGrievance.attachments?.length > 0 && (
                  <div className="detail-attachments">
                    <strong>Attachments:</strong>
                    <div className="attachment-list">
                      {selectedGrievance.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          📎 {file.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="status-history">
                  <strong>Status History:</strong>
                  <div className="history-list">
                    {selectedGrievance.statusHistory?.map((h, i) => (
                      <div key={i} className="history-item">
                        <span className={`history-dot status-${h.status}`}></span>
                        <div>
                          <span className="history-status">{h.status}</span>
                          <span className="history-date">{new Date(h.timestamp).toLocaleString()}</span>
                          {h.remarks && <p className="history-remarks">{h.remarks}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="update-form">
                  <h4>Update Grievance</h4>
                  <div className="update-field">
                    <label>Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="update-field">
                    <label>Official Remarks</label>
                    <textarea
                      rows={3}
                      value={updateForm.remarks}
                      onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
                      placeholder="Add official response/remarks..."
                    />
                  </div>
                  <button
                    className="update-btn"
                    onClick={handleStatusUpdate}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Update'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="detail-empty">
                <span>👈</span>
                <p>Select a grievance to view details and manage</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;