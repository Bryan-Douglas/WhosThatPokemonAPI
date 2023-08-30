const express = require('express'); // Server Development Framework
const cors = require('cors'); // Cross Origin Resource Sharing
require('dotenv').config(); // Configures environment variables
const app = express(); // Calls the app to use express
const { PORT, BACKEND_URL, CORS_ORIGIN } = process.env; // These are the environment variables to be used
const routes = require('./routes/routes');
const axios = require('axios'); // Imports axios which is used for the API call

/*
* Middleware
* CORS, allows sharing data with apps on other servers, cross origin
* express.json() allows access to incoming data posted to the server as part of the req.body
*/

app.use(cors({ origin: CORS_ORIGIN })); // Makes the app use the cors origin
app.use(express.json()); // 
app.use(express.static('public')); //

app.get('/api/getRandomPokemon', async (req, res) => {
    try {
        const randomPokemonId = generateRandomPokemonId();
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
        res.json(response.data);
    }
    catch (error) {
        console.error('Error retrieving Pokemon data', error);
        res.status(500).json(`Server is running on port ${PORT}`);
    }})

function generateRandomPokemonId() {
    return Math.floor(Math.random() * 1004) + 1;
}    

app.use('/pokemon', routes);

app.get('/pokemon', (req, res) => {
    res.send(`'Express is running'`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});