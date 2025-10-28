import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import pokemonRoutes from "./routes/pokemon.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection with error handling
mongoose
  .connect("mongodb://127.0.0.1:27017/pokedex", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/pokemon", pokemonRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URL: mongodb://127.0.0.1:27017/pokedex`);
});
