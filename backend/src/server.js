import express from "express";
import "dotenv/config";
import dotenv from "dotenv";
import router  from "#routes/route.js";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sculptor-freebee-babbling.ngrok-free.dev"
   
  ],
}));
app.use(express.json());
app.use("/api/v1/", router);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Clean MVC Server running on port ${PORT}`);
});