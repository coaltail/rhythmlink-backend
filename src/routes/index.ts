import express from "express";
import authRoutes from "@routes/auth.routes"
import userRoutes from "@routes/user.routes"
import groupRoutes from "@routes/group.routes"
import messageRoutes from "@routes/message.routes"
const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/groups", groupRoutes)
router.use("/messages", messageRoutes);
export default router;