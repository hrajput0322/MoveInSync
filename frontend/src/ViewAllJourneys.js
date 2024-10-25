// src/ViewAllJourneys.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewAllJourneys = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all journeys from the backend
    axios
      .get('http://localhost:5000/getAllJourneys')
      .then((res) => {
        if (res.data.success) {
            console.log(res.data.data);
          setJourneys(res.data.data); // Set the journey data
        } else {
          setError('Failed to fetch journeys.');
        }
        setLoading(false); // Set loading to false
      })
      .catch((err) => {
        setError('Error fetching journeys.');
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
      <h1 className="text-center mb-4">All Journeys</h1>
      {journeys.length === 0 ? (
        <p className="text-center">No journeys available.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>End Location</th>
              <th>Driver Name</th>
              <th>Cab Number</th>
              <th>Estimated Time (mins)</th>
              <th>Estimated Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {journeys.map((journey) => (
              <tr key={journey.id}>
                <td>{journey.id}</td>
                <td>{journey.end_location}</td>
                <td>{journey.driver_name}</td>
                <td>{journey.cab_number}</td>
                <td>{journey.estimated_time}</td>
                <td>{journey.estimated_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAllJourneys;
