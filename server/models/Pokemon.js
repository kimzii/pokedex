import mongoose from "mongoose";

const pokemonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  type: String,
  stats: Array,
  description: String,
  evolvesFrom: String,
});

export default mongoose.model("Pokemon", pokemonSchema);
