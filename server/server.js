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
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/pokemon", pokemonRoutes);

// Add detailed route logging
app._router.stack
  .filter((r) => r.route)
  .forEach((r) => {
    console.log(`Route: ${r.route.path}`);
    console.log(`Methods:`, Object.keys(r.route.methods));
  });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URL: mongodb://127.0.0.1:27017/pokedex`);
});
