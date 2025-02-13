import express from "express";
import * as messageController from "@controllers/message.controller";

const router = express.Router();

router.post("/groups/:groupId", messageController.sendMessageToGroup);
router.post("/threads/:threadId/messages", messageController.replyToThread);
router.get("/users/me/threads", messageController.getUserThreads);
router.get("/threads/:threadId/messages", messageController.getThreadMessages);
router.get("/groups/:groupId/threads", messageController.getGroupThreads);

export default router;