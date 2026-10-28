import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../Icons'; // 👈 Centralized Import
import Header from '../Common/Header';
import MyProfileTab from './MyProfileTab';
import SecurityTab from './SecurityTab';
import MyGrievancesTab from './MyGrievancesTab';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <MyProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'grievances':
        return <MyGrievancesTab />;
      default:
        return <MyProfileTab />;
    }
  };

  return (
    <div className="profile-page-container">
      <Header onOpenComplaint={() => navigate('/dashboard')} />

      <div className="profile-layout">
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="sidebar-avatar-img" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <h3>{user?.username}</h3>
            <p>{user?.rollNumber}</p>
          </div>

          <nav className="sidebar-nav-menu">
            <button
              className={`sidebar-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Icons.User size={18} /> My Profile
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Icons.Lock size={18} /> Security & Privacy
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'grievances' ? 'active' : ''}`}
              onClick={() => setActiveTab('grievances')}
            >
              <Icons.Clipboard size={18} /> My Grievances
            </button>
            <button
              className={`sidebar-menu-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <Icons.Settings size={18} /> Preferences
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <Icons.Logout size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="profile-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Profile;