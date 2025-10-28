import mongoose from "mongoose";

const pokemonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: String,
  imageUrl: String,
  type: {
    type: String,
    required: true,
  },
  stats: {
    hp: String,
    attack: String,
    defense: String,
    specialAttack: String,
    specialDefense: String,
    speed: String,
  },
  description: String,
  evolvesFrom: String,
});

export default mongoose.model("Pokemon", pokemonSchema);
