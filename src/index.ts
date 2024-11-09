import express from "express";
import dotenv from "dotenv";
import sequelize from "@config/database";
import cors from "cors";
import requestLogger from "./middlewares/requestLogger";
import logger from "@utils/logger";
import routes from "@routes/index"
dotenv.config();

const PORT = process.env.PORT;
const serverHost = process.env.HOST
const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({
  extended: true,
}));

sequelize
  .sync()
  .then(() => {
    console.log("Database connected and synchronized.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

server.use(requestLogger);

server.use("/api", routes);


server.listen(PORT, () => {
  console.log(`Server started on: ${serverHost}:${PORT}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});