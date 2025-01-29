import express from "express";
import * as groupController from "@controllers/group.controller";
import multer from "multer";

const router = express.Router();
const FIVE_MB = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: FIVE_MB }
});

router.post("/", upload.single("mainImage"), groupController.createNewGroup);
router.get("/find/:id", groupController.getGroup);
router.get("/user/:id", groupController.getGroupsByUser);
router.get("/", groupController.searchGroups);
router.post("/:id/request", groupController.joinGroup);
router.get("/:id/request", groupController.getGroupRequests);
router.put("/:id/request", groupController.updateGroupRequest);

export default router;
