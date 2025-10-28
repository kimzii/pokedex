import express from "express";
import Pokemon from "../models/Pokemon.js";

const router = express.Router();

// Add a custom Pokemon
router.post("/custom", async (req, res) => {
  try {
    const { name, imageUrl, type, stats, description, evolvesFrom } = req.body;

    // Get next available ID
    const highestPokemon = await Pokemon.findOne().sort({ id: -1 }).limit(1);

    const newId = highestPokemon ? highestPokemon.id + 1 : 1001;

    // Create without any validation checks
    const pokemon = new Pokemon({
      id: newId,
      name,
      imageUrl,
      type,
      stats,
      description,
      evolvesFrom,
    });

    const savedPokemon = await pokemon.save();
    res.status(201).json(savedPokemon);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all custom Pokemon
router.get("/custom", async (req, res) => {
  try {
    const pokemon = await Pokemon.find();
    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
