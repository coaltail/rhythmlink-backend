import express from "express";
import authRoutes from "@routes/auth.routes"
import userRoutes from "@routes/user.routes"

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);


export default router;