import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons';
import Sidebar from '../ScrollFeed/Sidebar'; // 👈 Reusable Sidebar
import ProblemFeed from '../ProblemCards/ProblemFeed';
import ActionPinModal from '../Modals/ActionPinModal';
import ComplaintDrawer from '../Modals/ComplaintDrawer';
import './HomeDashboard.css';

const HomeDashboard = () => {
  const { user, verifyActionPin } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('votes');

  // Modals
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [pinModal, setPinModal] = useState({
    isOpen: false,
    title: '',
    actionLabel: '',
    pendingAction: null
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (department !== 'All') params.department = department;
      if (status !== 'All') params.status = status;
      params.sort = sortBy;

      const response = await grievanceAPI.getAll(params);
      setGrievances(response.data.grievances);
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
      showToast('Failed to load grievances', 'error');
    } finally {
      setLoading(false);
    }
  }, [department, status, sortBy]);

  const fetchStats = async () => {
    try {
      const response = await grievanceAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleVoteClick = (grievance) => {
    setPinModal({
      isOpen: true,
      title: 'Confirm Your Vote',
      actionLabel: 'Cast Vote',
      pendingAction: async (pin) => {
        try {
          const response = await grievanceAPI.upvote(grievance._id, pin);
          showToast(`Vote registered! Total: ${response.data.voteCount}`, 'success');
          fetchGrievances();
          fetchStats();
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Vote failed';
          if (err.response?.data?.alreadyVoted) {
            return { success: false, error: 'You have already voted on this issue' };
          }
          return { success: false, error: message };
        }
      }
    });
  };

  const handlePinSubmit = async (pin) => {
    const pinCheck = await verifyActionPin(pin);
    if (!pinCheck.success) {
      return { success: false, error: pinCheck.error };
    }

    if (pinModal.pendingAction) {
      const result = await pinModal.pendingAction(pin);
      if (result.success) {
        setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null });
      }
      return result;
    }
    return { success: true };
  };

  const handleComplaintPinRequired = ({ submitFn }) => {
    setPinModal({
      isOpen: true,
      title: 'Authorize Complaint Submission',
      actionLabel: 'Submit Complaint',
      pendingAction: async (pin) => {
        try {
          await submitFn(pin);
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Submission failed';
          return { success: false, error: message };
        }
      }
    });
  };

  const handleComplaintSuccess = (data) => {
    showToast(data.message || 'Complaint submitted successfully!', 'success');
    setIsComplaintOpen(false);
    fetchGrievances();
    fetchStats();
  };

  return (
    <div className="dashboard-dark-container">
      <Sidebar />

      <main className="dashboard-main-content">
        {/* Top Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-welcome">Welcome back, {user?.username}!</h1>
            <p className="dash-subtext">Your voice matters. Report issues anonymously and vote to prioritize.</p>
          </div>
         
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="dash-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-stat-icon blue"><Icons.Clipboard size={24} /></div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{stats.total}</span>
                <span className="dash-stat-label">Total Issues</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon green"><Icons.StatusResolved size={24} /></div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{stats.resolved}</span>
                <span className="dash-stat-label">Resolved</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon orange"><Icons.StatusProgress size={24} /></div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{stats.inProgress}</span>
                <span className="dash-stat-label">In Progress</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-icon red"><Icons.Flame size={24} /></div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{stats.highPriority}</span>
                <span className="dash-stat-label">High Priority</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters (You can style this dark later) */}
        <div className="dash-filters">
          <div className="dash-filter-group">
            <span>Department:</span>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="All">All</option>
              <option value="Hostel">Hostel</option>
              <option value="Academics">Academics</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Mess">Mess</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="dash-filter-group">
            <span>Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="votes">Most Voted</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Feed (Now using ProblemFeed component but with dark styles applied via wrapper) */}
        <div className="dash-feed-wrapper">
          <ProblemFeed
            grievances={grievances}
            loading={loading}
            onVoteClick={handleVoteClick}
          />
        </div>
      </main>

      <ComplaintDrawer
        isOpen={isComplaintOpen}
        onClose={() => setIsComplaintOpen(false)}
        onSuccess={handleComplaintSuccess}
        onPinRequired={handleComplaintPinRequired}
      />

      <ActionPinModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null })}
        onSubmit={handlePinSubmit}
        title={pinModal.title}
        actionLabel={pinModal.actionLabel}
      />

      {toast && (
        <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
          <span>{toast.type === 'success' ? <Icons.Check size={16} /> : <Icons.Close size={16} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;