import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const FeedbackForm = () => {
    const [username, setUsername] = useState('');
    const [experience, setExperience] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!username.trim() || !experience.trim()) {
            setMessage('Please fill in both fields.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/submitFeedback', {
                username,
                experience
            });

            if (response.data.success) {
                setMessage('Thank you for your feedback!');
                setUsername('');
                setExperience('');
            } else {
                setMessage('Failed to submit feedback.');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setMessage('An error occurred while submitting your feedback.');
        }
    };

    return (
        <div className="feedback-container">
            <h2>User Feedback</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="experience">Experience:</label>
                    <textarea
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Share your experience"
                        rows="5"
                        required
                    ></textarea>
                </div>
                <button type="submit" className="submit-button">Submit Feedback</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
};

export default FeedbackForm;
