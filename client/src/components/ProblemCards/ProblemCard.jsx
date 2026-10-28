import { useState, useEffect } from 'react';
import { grievanceAPI } from '../../services/api';
import StatusBadge from '../Common/StatusBadge';
import './ProblemCard.css';

const ProblemCard = ({ grievance, onVoteClick }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(grievance.voteCount);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setLocalVoteCount(grievance.voteCount);
  }, [grievance.voteCount]);

  const checkVoteStatus = async () => {
    try {
      const response = await grievanceAPI.getVoteStatus(grievance._id);
      setHasVoted(response.data.hasVoted);
    } catch (err) {
      console.error('Failed to check vote status');
    }
  };

  const handleVoteClick = async () => {
    if (hasVoted) {
      alert('Already Voted on this grievance');
      return;
    }
    setChecking(true);
    await checkVoteStatus();
    setChecking(false);
    onVoteClick(grievance);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      Hostel: '#f97316',
      Academics: '#3b82f6',
      Infrastructure: '#7c3aed',
      Mess: '#22c55e',
      Sports: '#06b6d4',
      Library: '#ec4899',
      Other: '#6b7280'
    };
    return colors[dept] || colors.Other;
  };

  return (
    <div className="problem-card">
      <div className="card-header">
        <div className="card-tags">
          <span
            className="dept-tag"
            style={{ borderColor: getDepartmentColor(grievance.department), color: getDepartmentColor(grievance.department) }}
          >
            {grievance.department}
          </span>
          <span className="card-time">{formatDate(grievance.createdAt)}</span>
        </div>
        <StatusBadge status={grievance.status} isHighPriority={grievance.isHighPriority} />
      </div>

      <h3 className="card-title">{grievance.title}</h3>
      <p className="card-description">{grievance.description}</p>

      {grievance.officialRemarks && (
        <div className="official-remarks">
          <span className="remarks-label">Official Remark:</span>
          <span className="remarks-text">{grievance.officialRemarks}</span>
        </div>
      )}

      <div className="card-footer">
        <div className="vote-section">
          <button
            className={`vote-btn ${hasVoted ? 'voted' : ''}`}
            onClick={handleVoteClick}
            disabled={hasVoted || checking}
          >
            <span className="vote-icon">{hasVoted ? '✓' : '▲'}</span>
            <span className="vote-text">{hasVoted ? 'Voted' : 'Vote'}</span>
          </button>
          <div className="vote-count">
            <span className="count-number">{localVoteCount}</span>
            <span className="count-label">votes</span>
          </div>
        </div>

        {localVoteCount > 0 && (
          <div className="vote-progress">
            <div
              className="progress-bar"
              style={{ width: `${Math.min((localVoteCount / 50) * 100, 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemCard;