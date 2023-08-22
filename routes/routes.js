const express = require('express');
const router = express.Router();
const axios = require('axios');

async function getAllPokemonData(url, allPokemonData = []) {
    try {
        const response = await axios.get(url);
        const { results, next } = response.data;

        allPokemonData.push(...results);

        if (next) {
            return await getAllPokemonData(next, allPokemonData);
        } else {
            return allPokemonData;
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching data from PokeApi');
    }
}

router.get('/', async (req, res) => {
    try {
        const allPokemon = await getAllPokemonData('https://pokeapi.co/api/v2/pokemon/');
        res.json(allPokemon);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from PokeAPI' });
    }
});

module.exports = router;