// src/Feedback.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all feedbacks from the backend
    axios
      .get('http://localhost:5000/getFeedbacks')
      .then((res) => {
        if (res.data.success) {
          setFeedbacks(res.data.data); // Set the feedback data
        } else {
          setError('Failed to fetch feedback.');
        }
        setLoading(false); // Set loading to false
      })
      .catch((err) => {
        setError('Error fetching feedback.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">User Feedback</h1>
      {feedbacks.length === 0 ? (
        <p className="text-center">No feedback available.</p>
      ) : (
        <div className="list-group">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="list-group-item mb-3">
              <h5 className="mb-1">Username: {feedback.username}</h5>
              <p className="mb-1">Experience: {feedback.experience}</p>
              <small className="text-muted">Submitted on: {new Date(feedback.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
