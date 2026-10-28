import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../Icons'; // 👈 Centralized Import
import api from '../../services/api';

const MyProfileTab = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    department: user?.department || 'CSE',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // API call placeholder
      // const response = await api.put('/users/profile', formData);
      // setUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content profile-tab">
      <div className="tab-header">
        <h2>My Profile</h2>
        <p>Manage your personal information and avatar</p>
      </div>

      <div className="profile-avatar-section">
        <div className="avatar-preview-container" onClick={() => fileInputRef.current?.click()}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-initial">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="avatar-overlay">
            {/* 📷 replaced with Camera Icon */}
            <Icons.Camera size={24} />
            <p>Change Photo</p>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <div className="avatar-info">
          <h4>{user?.username}</h4>
          <p>Roll: {user?.rollNumber}</p>
          <p>{user?.department} Department</p>
          <small>JPG, PNG or GIF. Max 2MB.</small>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Roll Number</label>
          <input type="text" value={user?.rollNumber || ''} disabled className="disabled-input" />
          <small style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* 🔒 replaced with Lock Icon */}
            <Icons.Lock size={12} /> Roll number cannot be changed
          </small>
        </div>

        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit mobile number" />
        </div>

        <div className="form-group">
          <label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="CIVIL">Civil (CIVIL)</option>
            <option value="MBA">Management (MBA)</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {message.text && (
          <div className={`form-message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default MyProfileTab;