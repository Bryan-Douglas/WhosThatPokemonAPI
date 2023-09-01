const knex = require('knex')(require('./knexfile'));
const express = require('express'); // Server Development Framework
const cors = require('cors'); // Cross Origin Resource Sharing
require('dotenv').config(); // Configures environment variables
const app = express(); // Calls the app to use express
const { PORT, BACKEND_URL, CORS_ORIGIN } = process.env; // These are the environment variables to be used

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

app.get('/api/scores', (req, res) => {
  knex
    .select('*')
    .from('scores')
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).send('Error getting scores');
    })
});

// Endpoint for score submission
app.post('/api/submitScore', async (req, res) => {
  try {
    const { name, score } = req.body;

    // Calculates the rank based on the submitted score
    const newRankQuery = knex('scores').count('rank_id as rank').where('score', '>', score);
    const [{ rank }] = await newRankQuery;

    // Increments the rank by 1 to get the correct rank for the new score
    const newRank = rank + 1;

    // Begins a transaction to update the ranks
    await knex.transaction( async (trx) => {
      // Updates existing scores to shift their ranks down
      await trx('scores')
        .where('score', '>', score)
        .increment('rank_id', 1);

      // Insert the new score with rank 1
      await trx('scores').insert({ rank_id: newRank, name, score });
    });

    // Responds with a success message or the inserted data
    res.status(201).json({ message: 'Score submitted successfully', data: result });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});