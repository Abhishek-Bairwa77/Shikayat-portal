import ProblemCard from './ProblemCard';
import './ProblemFeed.css';

const ProblemFeed = ({ grievances, loading, onVoteClick }) => {
  if (loading) {
    return (
      <div className="feed-loading">
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
        <div className="skeleton-card"></div>
      </div>
    );
  }

  if (!grievances || grievances.length === 0) {
    return (
      <div className="empty-feed">
        <div className="empty-icon">📭</div>
        <h3>No Grievances Found</h3>
        <p>There are no grievances matching your filters. Try adjusting the filters or be the first to report an issue!</p>
      </div>
    );
  }

  return (
    <div className="problem-feed">
      {grievances.map((grievance) => (
        <ProblemCard
          key={grievance._id}
          grievance={grievance}
          onVoteClick={onVoteClick}
        />
      ))}
    </div>
  );
};

export default ProblemFeed;