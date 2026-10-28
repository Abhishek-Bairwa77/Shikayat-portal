import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ onOpenComplaint }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <div className="header-logo" onClick={() => navigate('/dashboard')}>
          <span className="header-logo-icon">🎓</span>
          <h1 className="header-logo-text">SHIKAYAT</h1>
        </div>
      </div>

      <div className="header-right">
        {isAdmin && (
          <button className="admin-link" onClick={() => navigate('/admin')}>
            <span>🛡️</span> Admin Panel
          </button>
        )}

        <button className="new-complaint-btn" onClick={onOpenComplaint}>
          <span>+</span> New Complaint
        </button>

        <div className="user-menu-container">
          <button
            className="user-menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-dept">{user?.rollNumber} • {user?.department}</span>
            </div>
            <span className={`menu-chevron ${menuOpen ? 'open' : ''}`}>▾</span>
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-name">{user?.username}</p>
                <p className="dropdown-email">{user?.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                <span>🏠</span> Dashboard
              </button>
              {isAdmin && (
                <button className="dropdown-item" onClick={() => navigate('/admin')}>
                  <span>🛡️</span> Admin Panel
                </button>
              )}
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;