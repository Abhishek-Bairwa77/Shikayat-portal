import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SlidingAuth from './components/Auth/SlidingAuth';
import HomeDashboard from './components/Dashboard/HomeDashboard';
import Profile from './components/Profile/Profile';
import './App.css';
import ScrollFeed from './components/ScrollFeed/ScrollFeed';
import Notifications from './components/ScrollFeed/Notifications';
import LodgeComplaint from './components/ScrollFeed/LodgeComplaint';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading SHIKAYAT...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading SHIKAYAT...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <SlidingAuth />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <HomeDashboard />
          </ProtectedRoute>
        }
      />

         <Route 
        path="/lodge" 
        element={
          <ProtectedRoute>
            <LodgeComplaint />
          </ProtectedRoute>
        } 
      />
     
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/scroll" element={<ProtectedRoute><ScrollFeed /></ProtectedRoute>} />
      


<Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

    </Routes>

    
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;