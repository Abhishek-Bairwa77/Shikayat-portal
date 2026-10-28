import './StatusBadge.css';

const statusConfig = {
  submitted: { label: 'Submitted', class: 'status-submitted', icon: '📝' },
  'in-review': { label: 'Under Review', class: 'status-review', icon: '🔍' },
  'in-progress': { label: 'Action In Progress', class: 'status-progress', icon: '⚙️' },
  resolved: { label: 'Resolved', class: 'status-resolved', icon: '✅' }
};

const StatusBadge = ({ status, isHighPriority = false }) => {
  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <div className="status-badge-wrapper">
      {isHighPriority && (
        <span className="priority-flag">🔥 High Priority</span>
      )}
      <span className={`status-badge ${config.class}`}>
        <span className="badge-icon">{config.icon}</span>
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;