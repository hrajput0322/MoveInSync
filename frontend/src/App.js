import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MapComponent from './MapComponent';
import axios from 'axios';

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
          element={
            authenticated ? <MapComponent /> : <Login />
          }
        />
        <Route path="/login/failed" element={<h1>Login Failed</h1>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

const Login = () => {
  const handleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Please login with Google</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default App;
