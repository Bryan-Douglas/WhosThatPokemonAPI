const express = require('express');
const router = express.Router();
const axios = require('axios');

const generateRandomPokemonId = () => {
    return Math.floor(Math.random() * 1004) + 1;
  };

function decimetersToFeetAndInches(decimeters) {
    const feet = decimeters * 0.328084;
    const remainingFeet = Math.round(feet);
    const totalInches = feet * 12;
    const inches = Math.floor(totalInches);
    const remainingInches = Math.round((totalInches - inches));

    return { feet: remainingFeet, inches: remainingInches };
}

function hectogramsToPounds(hectograms) {
    const pounds = hectograms * 0.220462;
    const remainingPounds = Math.round(pounds);

    return { pounds: remainingPounds };
}

router.get('/getRandomPokemon', async (req, res) => {
    try {
        const randomPokemonId = generateRandomPokemonId();
        const pokemonData = await fetchPokemonData(randomPokemonId);
        res.json(pokemonData);
    } catch (error) {
        console.error('Error retrieving active pokemon data', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

async function fetchPokemonData(pokemonId) {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const altResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const spriteUrl = response.data.sprites.other['official-artwork'].front_default;
        const name = response.data.name;
        const types = response.data.types.map(typeObj => typeObj.type.name);
        const height = decimetersToFeetAndInches(response.data.height);
        const weight = hectogramsToPounds(response.data.weight);
        const genera = altResponse.data.genera[7].genus;
        const flavorText = altResponse.data.flavor_text_entries[0].flavor_text;
        const cleanFlavorText = flavorText.replace(//, ' ');
        const processedData = {
            id: pokemonId,
            spriteUrl: spriteUrl,
            name: name,
            types: types,
            height: height,
            weight: weight,
            genera: genera,
            flavor_text_entries: cleanFlavorText
        };
        return processedData;
    } catch (error) {
        console.error('Error fetching pokemon data', error);
        throw error;
    }
}

router.post('/handleCorrectGuess', (req, res) => {
    try {
        const { pokemon } = req.body;
        const handleCorrectGuess = (pokemon) => {
            setCorrectGuesses((prevGuesses) => [...prevGuesses, pokemon]);
            setScore((prevScore) => prevScore + 1);
            handleCorrectGuess(activePokemon);
        };
        res.json({ score: setScore });
    } catch (error) {
        console.error('Error handling correct guess', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;