import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { grievanceAPI } from '../../services/api';
import { Icons } from '../../Icons';
import Sidebar from './Sidebar'; // 👈 Common Sidebar Import
import ActionPinModal from '../Modals/ActionPinModal'; 
import './ScrollFeed.css';

const ScrollFeed = () => {
  const { verifyActionPin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL se tab uthayenge. Agar kuch nahi hai toh 'trending' default hoga.
  const currentTab = searchParams.get('tab') || 'trending';
  
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const feedContainerRef = useRef(null);

  // Upvote & Modal states
  const [toast, setToast] = useState(null);
  const [pinModal, setPinModal] = useState({
    isOpen: false,
    title: '',
    actionLabel: '',
    pendingAction: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Jab tab change ho, toh data fetch karein
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError('');
      setActiveIndex(0); // Scroll wapas top par le aayenge
      
      try {
        // Backend ko tab bhej rahe hain
        const response = await grievanceAPI.getScrollFeed(currentTab);
        setGrievances(response.data.grievances);
        
        // Scroll container ko top par reset karein
        if (feedContainerRef.current) {
          feedContainerRef.current.scrollTop = 0;
        }
      } catch (err) {
        console.error('Failed to fetch feed:', err);
        setError('Failed to load feed. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentTab]); // 👈 Jab bhi tab change hoga, data fetch hoga

  const handleScroll = () => {
    if (feedContainerRef.current) {
      const container = feedContainerRef.current;
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  // ==========================================
  // UPVOTE LOGIC
  // ==========================================
  const handleVoteClick = (grievanceId) => {
    setPinModal({
      isOpen: true,
      title: 'Confirm Your Vote',
      actionLabel: 'Cast Vote',
      pendingAction: async (pin) => {
        try {
          const response = await grievanceAPI.upvote(grievanceId, pin);
          
          setGrievances(prev => prev.map(g => 
            g._id === grievanceId 
              ? { ...g, voteCount: response.data.voteCount } 
              : g
          ));

          showToast(`Vote registered! Total: ${response.data.voteCount}`, 'success');
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Vote failed';
          if (err.response?.data?.alreadyVoted) {
            return { success: false, error: 'You have already voted on this issue' };
          }
          return { success: false, error: message };
        }
      }
    });
  };

  const handlePinSubmit = async (pin) => {
    const pinCheck = await verifyActionPin(pin);
    if (!pinCheck.success) {
      return { success: false, error: pinCheck.error };
    }

    if (pinModal.pendingAction) {
      const result = await pinModal.pendingAction(pin);
      if (result.success) {
        setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null });
      }
      return result;
    }
    return { success: true };
  };

  // ==========================================
  // SHARE LOGIC
  // ==========================================
  const handleShareClick = async () => {
    const activeGrievance = grievances[activeIndex];
    if (!activeGrievance) return;

    const shareData = {
      title: 'SHIKAYAT - Grievance',
      text: `Check out this grievance: ${activeGrievance.title}`,
      url: `${window.location.origin}/grievance/${activeGrievance._id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      if (err.name !== 'AbortError') showToast('Failed to share', 'error');
    }
  };

  const activeGrievance = grievances[activeIndex] || { voteCount: 0, comments: [] };

  return (
    <div className="scroll-page-container">
      {/* Reusable Sidebar */}
      <Sidebar />

      {/* ================= CENTER FEED ================= */}
      <main className="sf-main-content">
        <div className="sf-header">
          <div className="sf-live-badge">
            <span className="sf-live-dot"></span> 
            {currentTab === 'trending' && 'Live Campus Grievance Stream'}
            {currentTab === 'approved' && 'Resolved Complaints'}
            {currentTab === 'pending' && 'Pending Complaints'}
          </div>
        </div>

        <div className="sf-reels-container" ref={feedContainerRef} onScroll={handleScroll}>
          {loading ? (
            <div className="sf-loading">Loading grievances...</div>
          ) : error ? (
            <div className="sf-error">{error}</div>
          ) : grievances.length === 0 ? (
            <div className="sf-empty">
              <Icons.Inbox size={64} color="#64748b" />
              <h3>No complaints found in this section.</h3>
            </div>
          ) : (
            grievances.map((item) => (
              <div className="sf-reel-wrapper" key={item._id}>
                <div className="sf-card">
                  <div className="sf-card-tags">
                    <span className="sf-tag-category">{item.department || 'Other'}</span>
                    <span className="sf-tag-status">🟡 {item.status}</span>
                  </div>
                  
                  <h1 className="sf-card-title">{item.title}</h1>
                  
                  <div className="sf-card-meta">
                    <Icons.IDBadge size={16} /> Reported Anonymously • {new Date(item.createdAt).toLocaleDateString()}
                  </div>

                  {item.attachments && item.attachments.length > 0 && item.attachments[0].mimetype.startsWith('image/') ? (
                    <div className="sf-card-image-wrapper">
                      <img src={`http://localhost:5000${item.attachments[0].path}`} alt="Evidence" className="sf-card-image" />
                    </div>
                  ) : (
                    <div className="sf-default-image">
                      <Icons.FileText size={40} />
                      <span>No Image Attached</span>
                    </div>
                  )}

                  <p className="sf-card-desc">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ================= RIGHT ACTIONS ================= */}
      <aside className="sf-right-actions">
        {/* Upvote */}
        <div className="sf-action-btn-group">
          <button 
            className="sf-action-btn"
            onClick={() => handleVoteClick(activeGrievance._id)} 
          >
            <Icons.ArrowUp size={28} />
          </button>
          <span className="sf-action-count">{activeGrievance.voteCount || 0}</span>
          <span className="sf-action-label">Upvotes</span>
        </div>

        {/* Comments */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn">
            <Icons.Comment size={26} />
          </button>
          <span className="sf-action-count">{activeGrievance.comments?.length || 0}</span>
          <span className="sf-action-label">Comments</span>
        </div>

        {/* Share */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn" onClick={handleShareClick}>
            <Icons.Share size={26} />
          </button>
          <span className="sf-action-count">0</span>
          <span className="sf-action-label">Shares</span>
        </div>

        {/* Track */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn">
            <Icons.Bookmark size={26} />
          </button>
          <span className="sf-action-label">Track</span>
        </div>
      </aside>

      {/* Action PIN Modal */}
      <ActionPinModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, title: '', actionLabel: '', pendingAction: null })}
        onSubmit={handlePinSubmit}
        title={pinModal.title}
        actionLabel={pinModal.actionLabel}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
          <span>{toast.type === 'success' ? <Icons.Check size={16} /> : <Icons.Close size={16} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ScrollFeed;