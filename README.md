## **Video Demonstration**
https://github.com/user-attachments/assets/2a1ae5b7-03ba-4131-8b3f-4c66edc9fd3d

## **Github Repo Link**
https://github.com/hrajput0322/moveinsync

## **Website Documentation**

---

## **Overview**
This website is a ride-sharing web application that provides users with various features, including route viewing, ride sharing, and feedback collection. The application integrates **Google OAuth** for authentication, uses **Mapbox API** for route navigation, and **Twilio API** for sharing ride details via SMS. The **admin panel** allows admins to view all rides and feedback. The website is hosted using **Render** and **Vercel** for frontend and backend services, while data is stored in **Azure MySQL**.

---

## **Features**

### 1. **Login through Google OAuth**
Users can authenticate themselves using Google OAuth. This allows for easy, secure, and quick login without needing to create separate credentials for the application.

**Technology Used:**
- **Google OAuth 2.0** for user authentication.

**Flow:**
- User clicks "Login with Google."
- They are redirected to the Google login page.
- After successful login, they are redirected back to the website with authentication.

**API Route:**
- `/auth/google` → Redirects to the Google OAuth page.
- `/auth/google/callback` → Handles the Google login callback and authenticates the user.

---

### 2. **Admin Panel**
Admins can access an exclusive dashboard that allows them to view all user journeys and feedback submitted by users. The admin panel provides navigation options to view rides and feedback data in a structured format.

**Admin Features:**
- View all journeys: Displays a list of all rides with details such as destination, estimated time, and cost.
- View all feedback: Admin can review user feedback submitted after each journey.

**Access Control:**
- Admins are authenticated through a password-based login option. Non-admin users cannot access the admin panel.

---

### 3. **User Location and Route Viewing (Mapbox API)**
Users can view their current location on the map and select a destination. The app will show the route from the current location to the destination using **Mapbox API**.

**Key Features:**
- Geolocation to automatically detect the user's current position.
- Users can input a destination address, and the app will calculate the optimal route.

**Mapbox API Integration:**
- The **Mapbox API** is used to fetch the map, show the user's location, and display the selected destination.
- The route is plotted dynamically between the current location and the destination.

**Steps:**
- Users are asked for permission to access their location.
- The current location is shown on the map.
- The user inputs their desired destination, and the map displays the route.

**API Integration:**
- **Geocoding API**: Converts the user’s entered destination to geographic coordinates.
- **Directions API**: Calculates the route and provides the data required to draw it on the map.

---

### 4. **Estimated Travel Time and Cost**
Once the user selects a destination, the system calculates and displays the estimated time and cost for the ride.

**Calculation Logic:**
- **Time**: Derived from the **Mapbox Directions API**, which provides the estimated duration of the trip.
- **Cost**: Calculated based on the distance between the current location and the destination. The formula used is:
  ```
  Cost = Distance (km) × ₹20 (cost per kilometer)
  ```

**Display:**
- The estimated travel time and cost are displayed to the user after the route is calculated.

---

### 5. **Share Ride Details via SMS (Twilio API)**
Users can share the ride details, such as the estimated time and cost, with a companion using **Twilio's SMS service**. The SMS contains information about the ride, including the estimated time of arrival.

**Twilio Integration:**
- **Twilio API** is used to send SMS notifications to the companion.
- The user enters the companion's phone number, and Twilio sends an SMS with ride details.

**SMS Details:**
- Includes information such as:
  - Driver Name (if available)
  - Estimated Arrival Time
  - Destination
  - Ride Cost

**API Route for Sending SMS:**
- `/sendSMS`: This backend route handles the sending of SMS messages to the companion using Twilio's API.

---

### 6. **Ride Completion SMS**
When the ride ends, the companion receives another SMS, notifying them that the user has reached the destination. This SMS also contains a **feedback link** where the companion can submit feedback about the ride.

**Flow:**
- Once the user clicks the **End Ride** button, Twilio sends an SMS to the companion.
- The SMS contains the feedback link (hosted on **Vercel** and **Render**), where the companion can leave feedback about the experience.

**API Route for End Ride SMS:**
- `/endRideSMS`: This backend route handles sending the ride completion SMS via Twilio.

---

### 7. **Ride Details and Feedback Storage (Azure MySQL)**
All user journeys and feedback are stored in an **Azure MySQL Cloud Database** for persistence. This allows the admin to view and analyze ride data and feedback at any time.

**Database Tables:**
- **`journeys` table**: Stores details of every ride, including the start location, end location, driver details, estimated time, and cost.
  
  Example Schema:
  ```sql
  CREATE TABLE journeys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    end_location VARCHAR(255),
    driver_name VARCHAR(100),
    cab_number VARCHAR(50),
    estimated_time INT,
    estimated_cost DECIMAL(10, 2)
  );
  ```

- **`user_feedback` table**: Stores feedback submitted by companions or users after the ride ends.

  Example Schema:
  ```sql
  CREATE TABLE user_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    experience TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

---

### 8. **Admin View of Journeys and Feedbacks**
Admins can access the **Admin Panel** to view all ride journeys and feedback submitted by users.

- **All Journeys**: A list of all journeys is shown, including details like the end location, driver name, estimated time, and cost.
- **Feedback**: Admins can view all feedback entries from users. Each feedback includes the username, experience, and the date/time it was submitted.

**Admin Panel Routes:**
- `/admin`: Displays the admin dashboard.
- `/viewAllJourneys`: Shows a list of all journeys.
- `/feedbacks`: Displays all user feedback in a structured format.

---

## **Technology Stack**

- **Frontend**: 
  - **React.js** for user interface.
  - **Bootstrap** for styling and responsive design.
  - **Mapbox API** for map and route integration.
  
- **Backend**:
  - **Node.js/Express.js** to handle API requests and serve data to the frontend.
  - **Twilio API** for sending SMS notifications.
  
- **Database**:
  - **Azure MySQL Cloud Database** for storing ride and feedback data.

- **Authentication**:
  - **Google OAuth 2.0** for user authentication.

- **Hosting**:
  - **Vercel** for frontend deployment.
  - **Render** for backend deployment.

---

## **Deployment and Hosting**

### 1. **Frontend**:
- **Vercel** is used for hosting the frontend (React app).
  - The feedback page is hosted here and linked in the SMS that the companion receives at the end of the ride.

### 2. **Backend**:
- **Render** is used to deploy the backend (Node.js and Express).
  - Handles Google OAuth, Twilio integration, and interactions with the database.

### 3. **Database**:
- **Azure MySQL Cloud** stores all the ride and feedback data.

---

## **How to Set Up the Project Locally**

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. **Backend Setup**
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the backend root directory:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   DB_HOST=your-database-host
   DB_USER=your-database-username
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   ```
3. Start the backend server:
   ```bash
   npm start
   ```

### 3. **Frontend Setup**
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the frontend root directory:
   ```bash
   REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
   ```
3. Start the frontend:
   ```bash
   npm start
   ```

### 4. **Database Setup**
- Create the **Azure MySQL** database and tables using the SQL schemas provided earlier.

---

### **Conclusion**
This ride-sharing application integrates multiple APIs and services (Google OAuth, Mapbox, Twilio) to provide a feature-rich, user-friendly platform. The admin panel allows for easy management of rides and feedback, while the backend ensures all data is securely stored and accessible via the cloud.
