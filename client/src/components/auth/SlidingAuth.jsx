import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SlidingAuth.css';
import logo from '../../assets/logo.png';

const SlidingAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const { login, register } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    rollNumber: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    actionPin: '',
    department: 'CSE'
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!loginData.identifier.trim() || !loginData.password.trim()) {
      setFormError('Please enter both identifier and password');
      return;
    }

    setLoading(true);
    const result = await login(loginData.identifier.trim(), loginData.password);
    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    const { rollNumber, username, email, password, confirmPassword, actionPin } = registerData;

    if (!rollNumber.trim() || !username.trim() || !email.trim() || !password || !actionPin) {
      setFormError('All required fields must be filled');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!/^\d{4}$/.test(actionPin)) {
      setFormError('Action PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    const result = await register({
      rollNumber: rollNumber.trim(),
      username: username.trim(),
      email: email.trim(),
      mobile: registerData.mobile.trim(),
      password,
      actionPin,
      department: registerData.department
    });
    setLoading(false);

    if (result.success) {
      setFormSuccess('Registration successful! Logging you in...');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-wrapper ${isLogin ? 'login-mode' : 'register-mode'}`}>
        {/* Left Branding Panel — logo as full background */}
        <div
          className="branding-panel"
          style={{ backgroundImage: `url(${logo})` }}
        >
          {/* Dark overlay for text readability (CSS handles it via ::before) */}
         
          <div className="branding-decoration">
            <div className="deco-circle deco-1"></div>
            <div className="deco-circle deco-2"></div>
            <div className="deco-circle deco-3"></div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          className="toggle-btn"
          onClick={() => {
            setIsLogin(!isLogin);
            setFormError('');
            setFormSuccess('');
          }}
          aria-label="Toggle auth mode"
        >
          <span className={`arrow ${isLogin ? '' : 'rotate'}`}>›</span>
        </button>

        {/* Right Form Panel */}
        <div className="form-panel">
          {/* Login Form */}
          <div className={`form-content login-content ${isLogin ? 'active' : ''}`}>
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your grievance portal</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="identifier">Roll Number / Email / Username</label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={loginData.identifier}
                  onChange={handleLoginChange}
                  placeholder="Enter your Roll Number or Email"
                  autoComplete="username"
                />
              </div>

              <div className="input-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {formError && <div className="form-message error">{formError}</div>}
              {formSuccess && <div className="form-message success">{formSuccess}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="btn-loader"></span> : 'Sign In'}
              </button>

              <p className="switch-text">
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsLogin(false)} className="link-btn">
                  Register here
                </button>
              </p>
            </form>
          </div>

          {/* Register Form */}
          <div className={`form-content register-content ${!isLogin ? 'active' : ''}`}>
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Join the SHIKAYAT community</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="auth-form register-form">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="rollNumber">Roll Number *</label>
                  <input
                    type="text"
                    id="rollNumber"
                    name="rollNumber"
                    value={registerData.rollNumber}
                    onChange={handleRegisterChange}
                    placeholder="e.g., 21CS001"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="email">Institutional Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="you@college.edu"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="mobile">Mobile (Optional)</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={registerData.mobile}
                    onChange={handleRegisterChange}
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={registerData.department}
                  onChange={handleRegisterChange}
                >
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

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="actionPin">4-Digit Action PIN *</label>
                <input
                  type="password"
                  id="actionPin"
                  name="actionPin"
                  value={registerData.actionPin}
                  onChange={handleRegisterChange}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d{4}"
                />
                <small className="input-hint">
                  This PIN is required for voting and filing complaints
                </small>
              </div>

              {formError && <div className="form-message error">{formError}</div>}
              {formSuccess && <div className="form-message success">{formSuccess}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="btn-loader"></span> : 'Create Account'}
              </button>

              <p className="switch-text">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsLogin(true)} className="link-btn">
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingAuth;