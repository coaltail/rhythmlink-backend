import { GroupCreateRequest, GroupCreateResponse } from "@interface/group";
import { Response } from "express";
import logger from "@utils/logger";
import { validationResult } from "express-validator";
import * as userService from "@services/user.service"
import { ApiError, ApiValidationError, UserNotFoundError } from "@common/errors";
import { MusicGenre } from "@models/user";
import * as groupService from "@services/group.service"
import { IRequestUser } from "@interface/auth";

export const createNewGroup = async (req: IRequestUser, res: Response<GroupCreateResponse | { message: string }>) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }
        const { groupData } = req.body
        const mainImage = req.file
        const data: GroupCreateRequest = JSON.parse(groupData);
        const owner = userService.findUserById(data.ownerId);
        if (!owner) {
            throw new UserNotFoundError(`Owner with id ${data.ownerId} not found.`);
        }
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedImageTypes.includes(mainImage.mimetype)) {
            throw new ApiValidationError("Invalid image type. Only JPG, PNG, and JPEG are allowed.", []);
        }

        const userId = req.user.userId;
        if (userId != data.ownerId) {
            throw new ApiValidationError("Cannot use another owner as a group owner.", []);
        }

        const genreArray: Array<MusicGenre> = data.genres;
        const newGroup = await groupService.createNewGroup(data.ownerId, data.name, genreArray, mainImage)
        res.status(201).json(newGroup);
    } catch (error: unknown) {

        logger.error("Create new group error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            })
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
}