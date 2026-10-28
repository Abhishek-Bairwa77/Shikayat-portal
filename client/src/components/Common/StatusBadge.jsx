import { Icons } from '../../Icons'; 
import './StatusBadge.css';

const statusConfig = {
  submitted: { 
    label: 'Submitted', 
    class: 'status-submitted', 
    icon: <Icons.StatusSubmitted size={14} /> 
  },
  'in-review': { 
    label: 'Under Review', 
    class: 'status-review', 
    icon: <Icons.StatusReview size={14} /> 
  },
  'in-progress': { 
    label: 'Action In Progress', 
    class: 'status-progress', 
    icon: <Icons.StatusProgress size={14} /> 
  },
  resolved: { 
    label: 'Resolved', 
    class: 'status-resolved', 
    icon: <Icons.StatusResolved size={14} /> 
  }
};

const StatusBadge = ({ status, isHighPriority = false }) => {
  const config = statusConfig[status] || statusConfig.submitted;

  return (
    <div className="status-badge-wrapper">
      {isHighPriority && (
        <span className="priority-flag">
          <Icons.Flame size={14} /> High Priority
        </span>
      )}
      
      <span className={`status-badge ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;