const express = require('express'); // Server Development Framework
const cors = require('cors'); // Cross Origin Resource Sharing
require('dotenv').config(); // Configures environment variables
const app = express(); // Calls the app to use express
const { PORT, BACKEND_URL, CORS_ORIGIN } = process.env; // These are the environment variables to be used
const axios = require('axios'); // Imports axios which is used for the API call

/*
* Middleware
* CORS, allows sharing data with apps on other servers, cross origin
* express.json() allows access to incoming data posted to the server as part of the req.body
*/

const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your React app's URL
    methods: 'GET,POST', // Add other methods if needed
  };
  
  app.use(cors(corsOptions));

// app.use(cors({ origin: CORS_ORIGIN })); // Makes the app use the cors origin
app.use(express.json()); // 
app.use(express.static('public')); //
const routes = require('./routes/routes');
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});