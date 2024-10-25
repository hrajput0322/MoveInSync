// src/AdminPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap

// Admin Page Component
const AdminPage = () => {
  const navigate = useNavigate();

  const goToAllJourneys = () => {
    navigate('/viewAllJourneys');
  };

  const goToFeedbacks = () => {
    navigate('/feedbacks');
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Admin Dashboard</h1>
        <p className="lead">Welcome to the admin dashboard. Manage journeys and feedback here.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">View All Journeys</h5>
              <p className="card-text">View, manage, and track all the journeys made.</p>
              <button className="btn btn-primary" onClick={goToAllJourneys}>
                View All Journeys
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">View Feedbacks</h5>
              <p className="card-text">Check feedback submitted by users.</p>
              <button className="btn btn-secondary" onClick={goToFeedbacks}>
                View Feedbacks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
