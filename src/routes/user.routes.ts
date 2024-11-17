import express from "express"
import * as userController from "@controllers/user.controller"
import { validateRegisterRequest } from "@common/validation";

const router = express.Router();

router.post("/", validateRegisterRequest, userController.registerUser)

export default router;