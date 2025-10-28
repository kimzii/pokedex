import express from "express";
import Pokemon from "../models/Pokemon.js";

const router = express.Router();

// Add a custom Pokemon
router.post("/custom", async (req, res) => {
  try {
    const { name, imageUrl, type, stats, description, evolvesFrom } = req.body;

    console.log("Received Pokemon data:", {
      name,
      type, // Log the type specifically
      stats,
    });

    const highestPokemon = await Pokemon.findOne().sort({ id: -1 }).limit(1);
    const newId = highestPokemon ? highestPokemon.id + 1 : 1001;

    const pokemon = new Pokemon({
      id: newId,
      name,
      imageUrl,
      type, // Store the type directly
      stats,
      description,
      evolvesFrom,
    });

    const savedPokemon = await pokemon.save();
    console.log("Saved Pokemon type:", savedPokemon.type); // Debug log
    res.status(201).json(savedPokemon);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Internal server error" });
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

// Delete a custom Pokemon
router.delete("/custom/:id", async (req, res) => {
  try {
    const pokemonId = Number(req.params.id);
    console.log("Attempting to delete Pokemon ID:", pokemonId);

    const deletedPokemon = await Pokemon.findOneAndDelete({ id: pokemonId });

    if (!deletedPokemon) {
      console.log("Pokemon not found:", pokemonId);
      return res.status(404).json({
        success: false,
        message: `Pokemon with id ${pokemonId} not found`,
      });
    }

    console.log("Successfully deleted Pokemon:", deletedPokemon);
    res.status(200).json({
      success: true,
      message: "Pokemon deleted successfully",
      data: deletedPokemon,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting Pokemon",
      error: error.message,
    });
  }
});

export default router;
