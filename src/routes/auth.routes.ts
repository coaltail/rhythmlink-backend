import express from "express";
import * as authController from "@controllers/auth.controller"
import { validateLoginRequest } from "@common/validation";

const router = express.Router();

router.post("/login", validateLoginRequest, authController.loginUser)

export default router;