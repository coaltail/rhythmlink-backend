import express from "express"
import * as userController from "@controllers/user.controller"
import { validateEditProfileRequest, validateGetUserRequest, validateRegisterRequest } from "@common/validation";

const router = express.Router();

router.post("/", validateRegisterRequest, userController.registerUser)
router.get("/me", validateGetUserRequest, userController.getUser)
//router.patch("/me", validateEditProfileRequest, userController.editProfile)
export default router;