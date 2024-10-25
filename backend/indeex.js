const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const mysql = require('mysql2');
require("dotenv").config();

const app = express();

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


// Replace with your credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST',
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login/failed',
    successRedirect: 'http://localhost:3000',
  })
);

app.get('/login/failed', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'User failed to authenticate.',
  });
});

app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect('http://localhost:3000');
  });
});

app.get('/getuser', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user,
    });
  } else {
    res.json({
      success: false,
      user: null,
    });
  }
});

// New endpoint to send SMS via Twilio
app.post('/sendSMS', (req, res) => {
  const { phoneNumber, estimatedTime } = req.body;

  if (!phoneNumber || !estimatedTime) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  const messageBody = `
    ride details:
    Driver: John Doe
    Vehicle: Toyota Camry
    License Plate: ABC-1234
    Estimated Arrival: ${estimatedTime} minutes
  `;

  client.messages
    .create({
      body: messageBody,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })
    .then((message) => {
      console.log('Message sent:', message.sid);
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error sending SMS:', error);
      res.status(500).json({ success: false, error: 'Failed to send SMS' });
    });
});

app.post('/endRideSMS', (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }
  
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }
  
    const messageBody = `
      The ride has been completed.
      Your friend has reached their desired location
      You can give your feedback here: https://moveinsync-3ayb.vercel.app/
    `;
  
    client.messages
      .create({
        body: messageBody,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })
      .then((message) => {
        console.log('End Ride Message sent:', message.sid);
        res.json({ success: true });
      })
      .catch((error) => {
        console.error('Error sending End Ride SMS:', error);
        res.status(500).json({ success: false, error: 'Failed to send End Ride SMS' });
      });
  });

app.post('/saveJourney', (req, res) => {
    const { destination, driverName, cabNumber, estimatedTime, estimatedCost } = req.body;

  if (!destination || !driverName || !cabNumber || !estimatedTime || !estimatedCost) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  console.log("harsh");

  let query = "insert into journeys(end_location, driver_name, cab_number, estimated_time, estimated_cost) values(?, ?, ?, ?, ?)";
  connection.query(query, [destination, driverName, cabNumber, estimatedTime, estimatedCost], (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json({success: true});
    }
    });
})

app.get('/getAllJourneys', async (req, res) => {
  const query = 'SELECT * FROM journeys';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});

app.get('/getFeedbacks', async (req, res) => {
  const query = 'SELECT * FROM user_feedback ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, data: results });
  });
});
  
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});