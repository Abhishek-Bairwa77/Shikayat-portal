import { useState } from 'react';
import { grievanceAPI } from '../../services/api';
import './ComplaintDrawer.css';

const departments = ['Hostel', 'Academics', 'Infrastructure', 'Mess', 'Sports', 'Library', 'Other'];
const categories = ['General', 'Harassment', 'Ragging', 'Discrimination', 'Safety', 'Other'];

const ComplaintDrawer = ({ isOpen, onClose, onSuccess, onPinRequired }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: 'General',
    isConfidential: false
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!formData.department) {
      setError('Please select a department');
      return;
    }

    // Trigger PIN modal - pass form data to parent
    onPinRequired({
      formData,
      files,
      submitFn: async (actionPin) => {
        setLoading(true);
        try {
          const data = new FormData();
          data.append('title', formData.title.trim());
          data.append('description', formData.description.trim());
          data.append('department', formData.department);
          data.append('category', formData.category);
          data.append('isConfidential', formData.isConfidential);
          data.append('actionPin', actionPin);
          files.forEach((file) => data.append('attachments', file));

          const response = await grievanceAPI.create(data);
          setLoading(false);
          onSuccess(response.data);
          resetForm();
        } catch (err) {
          setLoading(false);
          throw err;
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      department: '',
      category: 'General',
      isConfidential: false
    });
    setFiles([]);
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const isSensitive = ['Harassment', 'Ragging', 'Discrimination'].includes(formData.category);

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div className="complaint-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>File a New Complaint</h2>
            <p>Your identity remains protected</p>
          </div>
          <button className="drawer-close" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              maxLength={200}
            />
            <span className="char-count">{formData.title.length}/200</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows={5}
              maxLength={2000}
            />
            <span className="char-count">{formData.description.length}/2000</span>
          </div>

          <div className="form-group">
            <label>Attach Evidence (Optional)</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input" className="file-upload-label">
                <span className="upload-icon">📎</span>
                <span>Click to upload images or documents</span>
                <small>Max 3 files, 5MB each</small>
              </label>
            </div>
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => removeFile(index)} className="file-remove">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`confidential-toggle ${isSensitive ? 'sensitive' : ''}`}>
            <label className="toggle-label">
              <input
                type="checkbox"
                name="isConfidential"
                checked={formData.isConfidential || isSensitive}
                onChange={handleChange}
                disabled={isSensitive}
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">
                <strong>🔒 Mark as Confidential</strong>
                <small>
                  {isSensitive
                    ? 'This category is automatically confidential and routed to ICC/Admin committee'
                    : 'Confidential complaints are hidden from public feed and routed to admin committee'}
                </small>
              </span>
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="drawer-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintDrawer;