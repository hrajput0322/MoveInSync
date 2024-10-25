import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling
import './App.css'; // Optional: Add custom styles

import MapComponent from './MapComponent';
import AdminPage from './AdminPage';
import ViewAllJourneys from './ViewAllJourneys';
import axios from 'axios';
import Feedback from './Feedback';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/getuser', { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setAuthenticated(false);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={authenticated ? <MapComponent /> : <Login />}
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/viewAllJourneys" element={<ViewAllJourneys />} />
        <Route path="/login/failed" element={<h1>Login Failed</h1>} />
        <Route path="/feedbacks" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLoginError, setShowAdminLoginError] = useState(false);

  // Handle Google login
  const handleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  // Handle admin login with password
  const handleAdminLogin = () => {
    if (adminPassword === '12345') {
      navigate('/admin'); // Redirect to admin page
    } else {
      setShowAdminLoginError(true); // Show error if password is incorrect
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        
        <button className="btn btn-primary btn-block mb-3" onClick={handleLogin}>
          Login with Google
        </button>

        <div className="mt-4">
          <label htmlFor="admin-password" className="form-label">Login as admin:</label>
          <input
            type="password"
            id="admin-password"
            className="form-control"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
          />
          <button
            className="btn btn-secondary btn-block mt-3"
            onClick={handleAdminLogin}
          >
            Login
          </button>

          {showAdminLoginError && (
            <p className="text-danger mt-3">Incorrect password. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
