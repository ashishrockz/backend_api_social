require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require('./service/db');
const employeeapi = require('./router/employee');
const leaveapi = require('./router/leaves');
const auth = require('./router/auth')
// Database connection
connection();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // CORS middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/api/emp", employeeapi);
app.use("/api", leaveapi);
app.use("/auth", auth);

// Root route for API
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send('404: Not Found');
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}...`);
});
