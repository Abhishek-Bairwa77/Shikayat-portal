import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons'; // 👈 Centralized Import
import Header from '../Common/Header';
import FilterPills from '../Common/FilterPills';
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

  // Toast
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
    <div className="dashboard-container">
      <Header onOpenComplaint={() => setIsComplaintOpen(true)} />

      <main className="dashboard-main">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome back, {user?.username}!</h2>
            <p>Your voice matters. Report issues anonymously and vote to prioritize what needs attention.</p>
          </div>
          
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon"><Icons.Clipboard size={20} /></span>
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Issues</span>
              </div>
              <div className="stat-card stat-resolved">
                <span className="stat-icon"><Icons.StatusResolved size={20} /></span>
                <span className="stat-number">{stats.resolved}</span>
                <span className="stat-label">Resolved</span>
              </div>
              <div className="stat-card stat-progress">
                <span className="stat-icon"><Icons.StatusProgress size={20} /></span>
                <span className="stat-number">{stats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-card stat-priority">
                <span className="stat-icon"><Icons.Flame size={20} /></span>
                <span className="stat-number">{stats.highPriority}</span>
                <span className="stat-label">High Priority</span>
              </div>
            </div>
          )}
        </div>

        <FilterPills
          activeDepartment={department}
          onDepartmentChange={setDepartment}
          activeStatus={status}
          onStatusChange={setStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <ProblemFeed
          grievances={grievances}
          loading={loading}
          onVoteClick={handleVoteClick}
        />
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
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === 'success' ? <Icons.Check size={16} /> : <Icons.Close size={16} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default HomeDashboard;