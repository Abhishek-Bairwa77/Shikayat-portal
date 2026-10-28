import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../Icons';
import './Header.css';

const Header = ({ onOpenComplaint }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (path) => {
    setMenuOpen(false);
    if (location.pathname !== path) navigate(path);
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <div className="header-logo" onClick={() => handleMenuClick('/dashboard')}>
          <Icons.Logo size={28} className="logo-icon-svg" />
          <h1 className="header-logo-text">SHIKAYAT</h1>
        </div>
      </div>

      <div className="header-right">
        {isAdmin && (
          <button className="admin-link" onClick={() => handleMenuClick('/admin')}>
            <Icons.Admin size={16} /> Admin Panel
          </button>
        )}

        <button className="new-complaint-btn" onClick={() => { setMenuOpen(false); onOpenComplaint(); }}>
          <Icons.Plus size={16} /> New Complaint
        </button>

        <div className="user-menu-container" ref={menuRef}>
          <button className="user-menu-trigger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="header-avatar-img" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-dept">{user?.rollNumber} • {user?.department}</span>
            </div>
            
            <span className={`menu-chevron ${menuOpen ? 'open' : ''}`}>
              <Icons.ChevronDown size={16} />
            </span>
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-name">{user?.username}</p>
                <p className="dropdown-email">{user?.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item" onClick={() => handleMenuClick('/dashboard')}>
                <Icons.Dashboard size={18} /> Dashboard
              </button>
              
              <button className="dropdown-item" onClick={() => handleMenuClick('/profile')}>
                <Icons.User size={18} /> My Profile
              </button>

              {isAdmin && (
                <button className="dropdown-item" onClick={() => handleMenuClick('/admin')}>
                  <Icons.Admin size={18} /> Admin Panel
                </button>
              )}
              
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <Icons.Logout size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;