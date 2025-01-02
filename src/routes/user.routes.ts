import express from "express"
import * as userController from "@controllers/user.controller"
import { validateEditProfileRequest, validateRegisterRequest } from "@common/validation";
import multer from "multer";

const router = express.Router();
const FIVE_MB = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FIVE_MB }
});

router.post("/", validateRegisterRequest, userController.registerUser)
router.get("/me", userController.getUser)
router.patch("/", upload.single("mainImage"), validateEditProfileRequest, userController.editProfile)
export default router;