import express from "express";
import authRoutes from "@routes/auth.routes"
import userRoutes from "@routes/user.routes"
import groupRoutes from "@routes/group.routes"
const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/groups", groupRoutes)

export default router;