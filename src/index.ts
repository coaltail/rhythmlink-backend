import express from "express";
import dotenv from "dotenv";
import sequelize from "@config/database";
dotenv.config();

const PORT = process.env.PORT;
const server = express();

sequelize
  .sync()
  .then(() => {
    console.log("Database connected and synchronized.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

server.listen(PORT, () => {
  console.log(`Server started on: http://localhost:${PORT}`);
});
