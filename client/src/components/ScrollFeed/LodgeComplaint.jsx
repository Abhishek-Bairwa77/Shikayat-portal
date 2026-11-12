import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons';
import Sidebar from './Sidebar';
import ActionPinModal from '../Modals/ActionPinModal';
import './LodgeComplaint.css';

const LodgeComplaint = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    isConfidential: false
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Success Modal ka state
  const [successData, setSuccessData] = useState(null);

  const [pinModal, setPinModal] = useState({
    isOpen: false,
    title: '',
    actionLabel: '',
    pendingAction: null
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      setError('Maximum 3 files allowed');
      return;
    }
    const validFiles = selectedFiles.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files exceed the 5MB limit and were skipped');
    }
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and Description are required');
      return;
    }

    setPinModal({
      isOpen: true,
      title: 'Authorize Complaint',
      actionLabel: 'Submit',
      pendingAction: async (pin) => {
        setLoading(true);
        try {
          const data = new FormData();
          data.append('title', formData.title.trim());
          data.append('description', formData.description.trim());
          data.append('department', formData.department);
          data.append('isConfidential', formData.isConfidential);
          data.append('actionPin', pin);
          files.forEach((file) => data.append('attachments', file));

          const response = await grievanceAPI.create(data);
          setLoading(false);
           setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null });
          // 👈 SUCCESS MODAL KA DATA SET KAREIN
           setSuccessData({
            message: response.data.message,
            category: response.data.grievance.category,
            department: response.data.grievance.department,
            isFlagged: response.data.isFlagged
          });
          
          // Form reset karein
          setFormData({ title: '', description: '', department: '', isConfidential: false });
          setFiles([]);
          
          return { success: true };
        } catch (err) {
          setLoading(false);
          const message = err.response?.data?.message || 'Submission failed';
          return { success: false, error: message };
        }
      }
    });
  };

  const handlePinSubmit = async (pin) => {
    if (pinModal.pendingAction) {
      return await pinModal.pendingAction(pin);
    }
    return { success: true };
  };

  return (
    <div className="lodge-container">
      <Sidebar />

      <main className="lodge-main">
        <div className="lodge-header">
          <h1>Lodge a Complaint</h1>
          <p>Your identity remains 100% anonymous. Our AI will analyze and categorize your issue.</p>
        </div>

        <div className="lodge-form-card">
          <form onSubmit={handleSubmit} className="lodge-form">
            
            <div className="lc-group">
              <label>Complaint Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary (e.g., Water cooler not working in CSE block)"
                maxLength={100}
              />
            </div>

            <div className="lc-group">
              <label>Department (Optional)</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                <option value="">Let AI decide (Recommended)</option>
                <option value="Hostel">Hostel</option>
                <option value="Academics">Academics</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Mess">Mess</option>
                <option value="Sports">Sports</option>
                <option value="Library">Library</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="lc-group">
              <label>Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the issue in detail. Provide location, time, and any other details..."
                rows={6}
                maxLength={1500}
              />
            </div>

            <div className="lc-group">
              <label>Attach Evidence (Optional)</label>
              <div className="lc-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="lc-upload-label">
                  <Icons.Upload size={28} />
                  <span>Click to upload images or PDFs</span>
                  <small>Max 3 files, 5MB each</small>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="lc-file-list">
                  {files.map((file, index) => (
                    <div key={index} className="lc-file-item">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <Icons.Close size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lc-toggle-group">
              <label className="lc-toggle-label">
                <input
                  type="checkbox"
                  name="isConfidential"
                  checked={formData.isConfidential}
                  onChange={handleChange}
                />
                <span className="lc-toggle-text">
                  <strong>Mark as Confidential</strong>
                  <small>Hidden from public feed. Sent directly to ICC/Admin committee.</small>
                </span>
              </label>
            </div>

            {error && <div className="lc-error">{error}</div>}

            <button type="submit" className="lc-submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </main>

      <ActionPinModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null })}
        onSubmit={handlePinSubmit}
        title={pinModal.title}
        actionLabel={pinModal.actionLabel}
      />

      {/* 👈 SUCCESS MODAL UI */}
      {successData && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              {successData.isFlagged ? '⚠️' : '✅'}
            </div>
            <h2>{successData.isFlagged ? 'Under Review' : 'Complaint Submitted!'}</h2>
            <p>{successData.message}</p>
            
            <div className="ai-result-box">
              <strong>AI Analysis:</strong>
              <div className="ai-result-row">
                <span>Category:</span> <b>{successData.category}</b>
              </div>
              <div className="ai-result-row">
                <span>Department:</span> <b>{successData.department}</b>
              </div>
            </div>

            <button onClick={() => navigate('/scroll')} className="success-modal-btn">
              Continue to Feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LodgeComplaint;