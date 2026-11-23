import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../Icons';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Current URL check karke active state lagane ke liye
  const isActive = (path, tab = null) => {
    if (tab) {
      return location.pathname === path && new URLSearchParams(location.search).get('tab') === tab;
    }
    return location.pathname === path;
  };

  return (
    <aside className="sf-sidebar">
      <div className="sf-logo" onClick={() => navigate('/dashboard')}>
        <div className="sf-logo-icon"><Icons.Shield size={40} /></div>
        <div>
          <div className="sf-logo-text">SHIKAYAT <span className="sf-badge">PORTAL</span></div>
          <div className="sf-logo-sub">Campus Grievance Redressal</div>
        </div>
      </div>

      <nav className="sf-nav">
        <button className={`sf-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
          <Icons.HomeIcon size={22} /> Home
        </button>
        
        <button className={`sf-nav-item ${isActive('/scroll', 'trending') ? 'active' : ''}`} onClick={() => navigate('/scroll?tab=trending')}>
          <Icons.ScrollIcon size={22} /> Scroll
          {isActive('/scroll', 'trending') && <span className="sf-active-dot"></span>}
        </button>
        
        <button className={`sf-nav-item ${isActive('/scroll', 'approved') ? 'active' : ''}`} onClick={() => navigate('/scroll?tab=approved')}>
          <Icons.CheckCircle size={22} /> Approved
        </button>
        
        <button className={`sf-nav-item ${isActive('/notifications') ? 'active' : ''}`} onClick={() => navigate('/notifications')}>
          <Icons.Bell size={22} /> Notifications
        </button>
        
        <button className={`sf-nav-item ${isActive('/scroll', 'pending') ? 'active' : ''}`} onClick={() => navigate('/scroll?tab=pending')}>
          <Icons.FileText size={22} /> Pending
        </button>
      </nav>

      <button className="sf-lodge-btn" onClick={() => navigate('/lodge')}>
        <Icons.Plus size={20} /> Lodge Complaint
      </button>

      <div className="sf-user-footer" onClick={() => navigate('/profile')}>
        <div className="sf-user-avatar">
          {user?.avatar ? <img src={user.avatar} alt="avatar" /> : (user?.username?.charAt(0) || 'A')}
          <div className="sf-online-dot"></div>
        </div>
        <div className="sf-user-info">
          <h4>{user?.username || 'Anonymous Student'}</h4>
          <p>View Profile</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;