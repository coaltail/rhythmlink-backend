// src/controllers/message.controller.ts
import {
    ApiError,
    ApiValidationError,
} from "@common/errors";
import { Response } from "express";
import logger from "@utils/logger";
import { validationResult } from "express-validator";
import * as messageService from "@services/message.service";
import { IRequestUser } from "@interface/auth";
import { HttpStatusCode } from "@common/httpStatusCodes";

export const sendMessageToGroup = async (req: IRequestUser, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }

        const groupId = parseInt(req.params.groupId, 10);
        const userId = req.user.userId;
        const { content } = req.body;

        const result = await messageService.createGroupMessage(
            userId,
            groupId,
            content
        );

        res.status(HttpStatusCode.CREATED).json(result);
    } catch (error: unknown) {
        logger.error("Send message error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const replyToThread = async (req: IRequestUser, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }

        const threadId = parseInt(req.params.threadId, 10);
        const userId = req.user.userId;
        const { content, sendAsGroup } = req.body;

        const result = await messageService.createThreadReply(
            threadId,
            userId,
            content,
            sendAsGroup
        );

        res.status(HttpStatusCode.CREATED).json(result);
    } catch (error: unknown) {
        logger.error("Reply to thread error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserThreads = async (req: IRequestUser, res: Response) => {
    try {
        const userId = req.user.userId;
        const threads = await messageService.getUserThreads(userId);
        res.status(HttpStatusCode.OK).json(threads);
    } catch (error: unknown) {
        logger.error("Get user threads error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getThreadMessages = async (req: IRequestUser, res: Response) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const userId = req.user.userId;

        const messages = await messageService.getThreadMessages(threadId, userId);
        res.status(HttpStatusCode.OK).json(messages);
    } catch (error: unknown) {
        logger.error("Get thread messages error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroupThreads = async (req: IRequestUser, res: Response) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        const userId = req.user.userId;

        const threads = await messageService.getGroupThreads(groupId, userId);
        res.status(HttpStatusCode.OK).json(threads);
    } catch (error: unknown) {
        logger.error("Get group threads error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
};