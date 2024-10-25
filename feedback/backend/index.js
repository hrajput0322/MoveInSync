const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require("dotenv").config();

const app = express();

// MySQL Connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT || 3306,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
    },
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL database: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database with threadId: " + connection.threadId);
});

// Middleware
app.use(
    cors()
);

app.use(bodyParser.json());

app.get("/dummy", (req, res) => {
    res.send("backend is running");
});

app.post('/submitFeedback', (req, res) => {
    const { username, experience } = req.body;

    // Validate the input
    if (!username || !experience) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const query = "INSERT INTO user_feedback (username, experience) VALUES (?, ?)";
    connection.query(query, [username, experience], (err, results) => {
        if (err) {
            console.error("Error inserting feedback:", err);
            return res.status(500).json({ success: false, error: 'Database error.' });
        }
        return res.json({ success: true, message: 'Feedback submitted successfully.' });
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
