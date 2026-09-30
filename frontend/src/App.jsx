import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import OperatorView from './pages/OperatorView';
import MaintenanceView from './pages/MaintenanceView';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; // IMPORT NEW LOGIN PAGE

// The Bouncer: Protects routes from unauthorized access
function ProtectedRoute({ user, requiredRole, children }) {
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/maintenance" replace />;
    return children;
}

function NavLinks({ user, onLogout }) {
  const location = useLocation();
  const getLinkClass = (path) => `px-4 py-2 rounded-md font-bold transition-colors ${
      location.pathname === path ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }`;

  return (
    <nav className="bg-slate-800 p-4 shadow-lg mb-8 rounded-lg flex justify-between items-center">
      <div className="flex space-x-4">
          <Link to="/" className={getLinkClass('/')}>Operator Form</Link>
          
          {/* Only show these links if logged in */}
          {user && <Link to="/maintenance" className={getLinkClass('/maintenance')}>Maintenance Hub</Link>}
          {user?.role === 'Admin' && <Link to="/admin" className={getLinkClass('/admin')}>Admin Dashboard</Link>}
      </div>

      <div>
          {user ? (
              <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm font-bold">User: {user.username} ({user.role})</span>
                  <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors">Logout</button>
              </div>
          ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors">Login</Link>
          )}
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in when the app loads
  useEffect(() => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('authUser');
      setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto">
          <NavLinks user={user} onLogout={handleLogout} />
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<OperatorView />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            
            {/* Protected Routes */}
            <Route path="/maintenance" element={
                <ProtectedRoute user={user}>
                    <MaintenanceView />
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute user={user} requiredRole="Admin">
                    <AdminDashboard />
                </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;