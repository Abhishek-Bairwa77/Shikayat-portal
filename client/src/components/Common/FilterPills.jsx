import { Icons } from '../../Icons'; // 👈 Centralized Import
import './FilterPills.css';

const departments = ['All', 'Hostel', 'Academics', 'Infrastructure', 'Mess', 'Sports', 'Library', 'Other'];
const statuses = ['All', 'submitted', 'in-review', 'in-progress', 'resolved'];

const FilterPills = ({ activeDepartment, onDepartmentChange, activeStatus, onStatusChange, sortBy, onSortChange }) => {
  return (
    <div className="filter-section">
      {/* Department Filter */}
      <div className="filter-group">
        <span className="filter-label">
          <Icons.Clipboard size={16} className="filter-icon" /> Department:
        </span>
        <div className="pills-container">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`filter-pill ${activeDepartment === dept ? 'active' : ''}`}
              onClick={() => onDepartmentChange(dept)}
            >
              {dept === 'All' ? 'All' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="filter-group">
        <span className="filter-label">Status:</span>
        <div className="pills-container">
          {statuses.map((status) => (
            <button
              key={status}
              className={`filter-pill status-pill ${activeStatus === status ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              {status === 'All' ? 'All' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="filter-group sort-group">
        <span className="filter-label">
          <Icons.Chart size={16} className="filter-icon" /> Sort:
        </span>
        <div className="select-wrapper">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="votes">Most Voted</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <Icons.ChevronDown size={14} className="select-chevron" />
        </div>
      </div>
    </div>
  );
};

export default FilterPills;