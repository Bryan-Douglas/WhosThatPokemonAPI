const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon/');
        const pokemonData = response.data;
        res.json(pokemonData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data from PokeAPI' });
    }
});

module.exports = router;