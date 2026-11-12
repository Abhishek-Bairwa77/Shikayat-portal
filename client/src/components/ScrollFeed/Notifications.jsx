import { useState, useEffect } from 'react';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons';
import Sidebar from './Sidebar'; // 👈 Common Sidebar Import
import './Notifications.css';
import './ScrollFeed.css'; // Taaki sidebar ki css yahan bhi apply ho

const Notifications = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResolved = async () => {
      try {
        const response = await grievanceAPI.getResolved();
        setGrievances(response.data.grievances);
      } catch (err) {
        console.error('Failed to load resolved complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchResolved();
  }, []);

  return (
    <div className="notifications-container">
      {/* Reusable Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="notifications-main">
        
        {/* Header - ScrollFeed ke design jaisa */}
        <div className="sf-header" style={{ marginBottom: '40px' }}>
          <div className="sf-live-badge">
            <Icons.CheckCircle size={16} color="#22c55e" /> 
            <span>Resolved Complaints Feed</span>
          </div>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            See how SHIKAYAT is making a difference on campus.
          </p>
        </div>

        <div className="notifications-list">
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</p>
          ) : grievances.length === 0 ? (
            <div className="nc-empty">
              <Icons.CheckCircle size={64} color="#22c55e" />
              <h3>No resolved complaints yet.</h3>
              <p>Keep voting to push issues to resolution!</p>
            </div>
          ) : (
            grievances.map((item) => (
              <div key={item._id} className="notification-card">
                
                <div className="nc-top-row">
                  <span className="nc-status">
                    <Icons.CheckCircle size={16} /> Resolved
                  </span>
                  <span className="nc-date">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="nc-title">{item.title}</h3>
                <p className="nc-desc">{item.description}</p>
                
                {item.officialRemarks && (
                  <div className="nc-remarks">
                    <span className="nc-remarks-label">Admin's Official Remark</span>
                    <p className="nc-remarks-text">"{item.officialRemarks}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;