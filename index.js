const knex = require('knex')(require('./knexfile'));
const express = require('express'); // Server Development Framework
const cors = require('cors'); // Cross Origin Resource Sharing
require('dotenv').config(); // Configures environment variables
const app = express(); // Calls the app to use express
const { PORT } = process.env; // These are the environment variables to be used
const jwt = require('jsonwebtoken'); // library for signing and verifying JWT tokens
const bcrypt = require('bcrypt'); // library for hashing passwords.
const { body, validationResult } = require('express-validator'); // Library for validating inputs
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');

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
app.use(helmet());

// app.use(cors({ origin: CORS_ORIGIN })); // Makes the app use the cors origin
app.use(express.json()); // 
app.use(express.static('public')); //
const routes = require('./routes/routes');
app.use('/api', routes);

const authorize = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'no token found' })
  }

  // Token comes in as 'Bearer <Token>' so the token will be in position 1
  const authTokenArray = req.headers.authorization.split(' ');

  if (authTokenArray[0].toLowerCase() !== 'bearer' && authTokenArray.length !== 2) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Validates the JWT token
  jwt.verify(authTokenArray[1], process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      return res.status(401).json({ message: 'The token is expired or invalid' });
    }
  });
}

// Registration endpoint
app.post(
  '/api/register',
  [
    body('username')
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters long')
    .trim()
    .escape(),
    body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long')
    .trim()
    .escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Hashes the password using bcrypt
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      try {
        const userId = await knex('logins').insert({
          username: username,
          password: hash,
        });

        res.status(201).json({ message: 'User registered successfully', userId: userId });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    })
  });

// Logins endpoint
app.post('/api/logins', (req, res) => {
  const { username, password } = req.body;

  knex('logins')
    .select('login_id', 'password')
    .where('username', username)
    .first()
    .then((user) => {
      if (!user) {
        return res.status(403).json({ message: `This user doesn't exist. Please sign up!` });
      }

      // Compares the provided password with the stored hash
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        if (result) {
          // Generate a token and send it back
          const token = jwt.sign({
            name: user.name,
            username: username,
            loginTime: Date.now()
          }, process.env.JWT_SECRET, { expiresIn: '31d' });

          return res.status(200).json({ token });
        } else {
          return res.status(403).json({ message: 'Invalid username or password' });
        }
      });
    })
    .catch((error) => {
      console.error('Error querying user data:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

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

    const rank_id = uuidv4();

    // Calculates the rank based on the submitted score
    const newRankQuery = knex('scores')
    .count('rank as rank')
    .where('score', '>', score);
    const [{ rank }] = await newRankQuery;

    // Increments the rank by 1 to get the correct rank for the new score
    const newRank = rank + 1;

    // Begins a transaction to update the ranks
    await knex.transaction(async (trx) => {
      // Updates existing scores to shift their ranks down
      // await trx('scores')
      //   .where('score', '>', score)
      //   .increment('rank', 1);

      // Insert the new score with rank 1
      await trx('scores').insert({ rank_id, name, score, rank: newRank });

      const updatedScores = await knex
    .select('*')
    .from('scores')
    .orderBy('score', 'desc'); // Orders scores by highest to lowest

    for (let i = 0; i < updatedScores.length; i++) {
      await trx('scores')
      .where('rank_id', updatedScores[i].rank_id)
      .update('rank', i + 1);
    }
    });



    // Fetch the updated list of scores
    const updatedScores = await knex
    .select('*')
    .from('scores')
    .orderBy('score', 'desc'); // Orders scores by highest to lowest

    // for (let i = 0; i < updatedScores.length; i++) {
    //   await trx('scores')
    //   .where('rank_id', updatedScores[i].rank_id)
    //   .update('rank', i + 1);
    // }
  
    // Responds with a success message or the inserted data
    res.status(201).json({ message: 'Score submitted successfully', scores: updatedScores });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});