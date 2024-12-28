import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import sequelize from "@config/database";
import cors from "cors";
import requestLogger from "./middlewares/requestLogger";
import logger from "@utils/logger";
import routes from "@routes/index"
import { generateRandomUser } from "./mock/mockUserData";
import { checkJwtMiddleware } from "./middlewares/authMiddleware";
import { IRequestUser } from "@interface/auth";
dotenv.config();

const PORT = process.env.PORT;
const server = express();
const NODE_ENV = process.env.NODE_ENV
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
  .catch((error: unknown) => {
    console.error("Unable to connect to the database:", error);
  });

server.use(requestLogger);
server.get('/health-check', (_: Request, res: Response) => {
  res.status(200).json({ message: "Success!" })
});
server.use((req: IRequestUser, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/auth/login')) {
    return next();
  }
  if (req.url === '/api/users' && req.method === 'POST') {
    return next();
  }

  checkJwtMiddleware(req, res, next);
});

server.use("/api", routes);


server.use("*", async (_, res: Response) => {
  res.status(404).json({ message: "Endpoint not found." });
})
server.listen(PORT, () => {
  console.log(`Server started on: http://localhost:${PORT}`);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});