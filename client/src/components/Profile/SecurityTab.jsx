import { useState } from 'react';
import { Icons } from '../../Icons'; // 👈 Centralized Import

const SecurityTab = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: ''
  });

  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    
    // Future API call
    setTimeout(() => {
      setLoading(false);
      setMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pinData.newPin)) {
      setMsg({ type: 'error', text: 'New PIN must be exactly 4 digits' });
      return;
    }
    setLoading(true);

    // Future API call
    setTimeout(() => {
      setLoading(false);
      setMsg({ type: 'success', text: 'Action PIN updated successfully!' });
      setPinData({ currentPin: '', newPin: '' });
    }, 1000);
  };

  return (
    <div className="tab-content security-tab">
      <div className="tab-header">
        <h2>Security & Privacy</h2>
        <p>Protect your account with a strong password and PIN</p>
      </div>

      {/* Change Password Card */}
      <div className="security-card">
        <div className="card-title">
          <div className="card-icon">
            {/* 🔑 replaced with Key Icon */}
            <Icons.Key size={24} color="var(--navy-dark)" />
          </div>
          <div>
            <h3>Change Password</h3>
            <p>Update your login password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="security-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Change Action PIN Card */}
      <div className="security-card">
        <div className="card-title">
          <div className="card-icon">
            {/* 🔐 replaced with Shield Lock Icon */}
            <Icons.Shield size={24} color="var(--navy-dark)" />
          </div>
          <div>
            <h3>Change Action PIN</h3>
            <p>Used for voting and filing complaints</p>
          </div>
        </div>

        <form onSubmit={handlePinSubmit} className="security-form">
          <div className="form-group">
            <label>Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pinData.currentPin}
              onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pinData.newPin}
              onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="update-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update PIN'}
          </button>
        </form>
      </div>

      {msg.text && <div className={`form-message ${msg.type}`}>{msg.text}</div>}

      {/* Danger Zone */}
      <div className="danger-zone">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* ⚠️ replaced with Alert Icon */}
          <Icons.Alert size={20} color="var(--accent-red)" /> Danger Zone
        </h3>
        <p>Once you delete your account, there is no going back. Your complaints will remain but your identity will be anonymized.</p>
        <button className="delete-account-btn" onClick={() => alert('Delete Account feature coming soon')}>
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default SecurityTab;