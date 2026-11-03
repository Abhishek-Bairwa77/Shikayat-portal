import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../Icons';
import './ScrollFeed.css';

const mockGrievances = [
  {
    _id: '1',
    category: 'HOSTEL & SANITATION',
    status: 'Pending',
    title: 'Hostel Washrooms Have Not Been Cleaned for Several Days',
    description: "The sanitation staff hasn't attended to the 2nd floor restrooms in Block B since Thursday. The drains are backed up causing waterlogging and a terrible smell. Please look into this immediately.",
    voteCount: 278,
    commentCount: 38,
    shareCount: 19,
    timeAgo: '4h ago',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000', // Dummy Bathroom Image
  }
];

const ScrollFeed = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scroll');

  return (
    <div className="scroll-page-container">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="sf-sidebar">
        <div className="sf-logo" onClick={() => navigate('/dashboard')}>
          <div className="sf-logo-icon"><Icons.Shield size={32} /></div>
          <div>
            <div className="sf-logo-text">SHIKAYAT <span className="sf-badge">PORTAL</span></div>
            <div className="sf-logo-sub">Campus Grievance Redressal</div>
          </div>
        </div>

        <nav className="sf-nav">
          <button className="sf-nav-item" onClick={() => navigate('/dashboard')}>
            <Icons.HomeIcon size={22} /> Home
          </button>
          <button className="sf-nav-item active">
            <Icons.ScrollIcon size={22} /> Scroll
            <span className="sf-active-dot"></span>
          </button>
          <button className="sf-nav-item">
            <Icons.CheckCircle size={22} /> Approved
            <span className="sf-count">142</span>
          </button>
          <button className="sf-nav-item">
            <Icons.Bell size={22} /> Notifications
            <span className="sf-count sf-count-red">3</span>
          </button>
          <button className="sf-nav-item" onClick={() => navigate('/profile')}>
            <Icons.FileText size={22} /> Your Complaints
            <span className="sf-count">2</span>
          </button>
        </nav>

        <button className="sf-lodge-btn" onClick={() => navigate('/dashboard')}>
          <Icons.Plus size={20} /> Lodge Complaint
        </button>

        <div className="sf-user-footer">
          <div className="sf-user-avatar">
            {user?.avatar ? <img src={user.avatar} alt="avatar" /> : (user?.username?.charAt(0) || 'A')}
            <div className="sf-online-dot"></div>
          </div>
          <div className="sf-user-info">
            <h4>{user?.username || 'Anonymous Student'}</h4>
            <p onClick={() => navigate('/profile')}>View Profile</p>
          </div>
        </div>
      </aside>

      {/* ================= CENTER FEED ================= */}
      <main className="sf-main-content">
        <div className="sf-header">
          <div className="sf-live-badge">
            <span className="sf-live-dot"></span> Live Campus Grievance Stream
          </div>
          <p>Only verified college students can post. Your identity stays private.</p>
        </div>

        <div className="sf-feed-container">
          {mockGrievances.map((item) => (
            <div className="sf-card" key={item._id}>
              
              {/* Card Header */}
              <div className="sf-card-tags">
                <span className="sf-tag-category">{item.category}</span>
                <span className="sf-tag-status">🟡 {item.status}</span>
              </div>
              
              {/* Card Title */}
              <h1 className="sf-card-title">{item.title}</h1>
              
              {/* Card Meta */}
              <div className="sf-card-meta">
                <Icons.IDBadge size={16} /> Reported Anonymously • {item.timeAgo}
              </div>

              {/* Card Image */}
              <div className="sf-card-image-wrapper">
                <img src={item.image} alt="Evidence" className="sf-card-image" />
                <div className="sf-image-dots">
                  <span className="active"></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              {/* Card Description */}
              <p className="sf-card-desc">
                {item.description}
              </p>
              <button className="sf-read-more">Read more <Icons.ChevronDown size={16} /></button>
            </div>
          ))}
        </div>
      </main>

      {/* ================= RIGHT ACTIONS ================= */}
      <aside className="sf-right-actions">
        {/* Floating Sparkle Icon (Bottom Right) */}
        <div className="sf-sparkle-icon">
          <Icons.Sparkle size={32} color="#ffffff" />
        </div>

        {/* Upvote */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn">
            <Icons.ArrowUp size={28} />
          </button>
          <span className="sf-action-count">278</span>
          <span className="sf-action-label">Upvotes</span>
        </div>

        {/* Comments */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn" onClick={() => alert('Comments section coming soon in next step!')}>
            <Icons.Comment size={26} />
          </button>
          <span className="sf-action-count">38</span>
          <span className="sf-action-label">Comments</span>
        </div>

        {/* Share */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn">
            <Icons.Share size={26} />
          </button>
          <span className="sf-action-count">19</span>
          <span className="sf-action-label">Shares</span>
        </div>

        {/* Track / Bookmark */}
        <div className="sf-action-btn-group">
          <button className="sf-action-btn">
            <Icons.Bookmark size={26} />
          </button>
          <span className="sf-action-label">Track</span>
        </div>

        {/* Up / Down Navigation Arrows */}
        <div className="sf-scroll-arrows">
          <button className="sf-arrow-btn"><Icons.ChevronDown size={24} style={{transform: 'rotate(180deg)'}} /></button>
          <button className="sf-arrow-btn"><Icons.ChevronDown size={24} /></button>
        </div>
      </aside>
    </div>
  );
};

export default ScrollFeed;