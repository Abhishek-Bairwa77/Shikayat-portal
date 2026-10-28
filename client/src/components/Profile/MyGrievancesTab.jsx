import { useState, useEffect } from 'react';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons'; // 👈 Centralized Import
import StatusBadge from '../Common/StatusBadge';

const MyGrievancesTab = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchMyGrievances = async () => {
      try {
        const response = await grievanceAPI.getMy();
        setGrievances(response.data.grievances);
      } catch (err) {
        setError('Failed to load your grievances');
      } finally {
        setLoading(false);
      }
    };
    fetchMyGrievances();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="tab-loading">Loading your grievances...</div>;
  if (error) return <div className="tab-error">{error}</div>;

  return (
    <div className="tab-content grievances-tab">
      <div className="tab-header">
        <h2>My Grievances</h2>
        <p>All complaints filed by you and their current status</p>
      </div>

      {grievances.length === 0 ? (
        <div className="empty-state">
          {/* 📭 replaced with Inbox Icon */}
          <Icons.Inbox size={64} color="var(--gray-400)" style={{ marginBottom: '1.5vh' }} />
          <h3>No Grievances Filed Yet</h3>
          <p>You haven't filed any complaints. Your filed issues will appear here.</p>
        </div>
      ) : (
        <div className="my-grievances-list">
          {grievances.map((g) => (
            <div
              key={g._id}
              className={`my-grievance-card ${expandedId === g._id ? 'expanded' : ''}`}
              onClick={() => toggleExpand(g._id)}
            >
              <div className="card-main">
                <div className="card-left">
                  <h4>{g.title}</h4>
                  <div className="card-meta">
                    <span className="dept-tag">{g.department}</span>
                    {g.isConfidential && (
                      <span className="conf-tag">
                        {/* 🔒 replaced with Lock Icon */}
                        <Icons.Lock size={12} style={{ marginRight: '4px' }} /> Confidential
                      </span>
                    )}
                    <span className="vote-count">
                      {/* 👍 replaced with Vote Icon */}
                      <Icons.Vote size={14} style={{ marginRight: '4px' }} /> {g.voteCount} votes
                    </span>
                    <span className="date">{new Date(g.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-right">
                  <StatusBadge status={g.status} isHighPriority={g.isHighPriority} />
                  <span className={`expand-arrow ${expandedId === g._id ? 'open' : ''}`}>
                    {/* ▾ replaced with ChevronDown */}
                    <Icons.ChevronDown size={20} />
                  </span>
                </div>
              </div>

              {expandedId === g._id && (
                <div className="card-expanded-content">
                  <div className="expanded-desc">
                    <strong>Description:</strong>
                    <p>{g.description}</p>
                  </div>
                  
                  {g.officialRemarks && (
                    <div className="expanded-remarks">
                      <strong>Official Remarks:</strong>
                      <p>{g.officialRemarks}</p>
                    </div>
                  )}

                  {g.statusHistory && g.statusHistory.length > 0 && (
                    <div className="expanded-history">
                      <strong>Status History:</strong>
                      <ul>
                        {g.statusHistory.map((h, i) => (
                          <li key={i}>
                            <span className={`history-dot status-${h.status}`}></span>
                            <div>
                              <span className="history-status-text">{h.status}</span>
                              <span className="history-date-text">{new Date(h.timestamp).toLocaleString()}</span>
                              {h.remarks && <p className="history-remark-text">{h.remarks}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGrievancesTab;