import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import router from "./routes.js";
import { errorHandler } from "./middleware.js";

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => {
    console.error("Mongo connection failed", err.message);
    process.exit(1);
  });

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

app.listen(3001, () => {
  console.log("Server running on 3001");
});
