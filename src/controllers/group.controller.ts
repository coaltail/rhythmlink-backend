import { GroupCreateRequest, GroupCreateResponse, GroupGetResponse } from "@interface/group";
import { Request, Response } from "express";
import logger from "@utils/logger";
import { validationResult } from "express-validator";
import * as userService from "@services/user.service"
import { ApiError, ApiValidationError, UserNotFoundError } from "@common/errors";
import { MusicGenre } from "@models/user";
import * as groupService from "@services/group.service"
import { IRequestUser } from "@interface/auth";
import { HttpStatusCode } from "@common/httpStatusCodes";

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

export const getGroup = async (req: IRequestUser, res: Response<GroupGetResponse | { message: string }>) => {
    try {

        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid group ID." });
          return;
        }
  
      const getGroupResponse = await groupService.getGroup(id);
  
      res.status(HttpStatusCode.OK).json(getGroupResponse);

    } catch (error: unknown) {
      logger.error("Getting group error: ", error);
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

export const searchGroups = async (req: Request, res: Response) => {
    try {
        // Validate query parameters
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }

        const { name, genres, pageSize, pageNumber } = req.query;

        // If genres is provided, parse it correctly into an array
        let genresArray: string[] = [];
        if (genres) {
            try {
                genresArray = JSON.parse(genres as string);
            } catch (error: unknown) {
                logger.error(error);
                throw new ApiValidationError("Genres parameter must be a valid JSON array", []);
            }
        }

        // Default pageSize and pageNumber if not provided
        const pageSizeInt = pageSize ? parseInt(pageSize as string) : 20;
        const pageNumberInt = pageNumber ? parseInt(pageNumber as string) : 1;

        // Call the service to search groups
        const groups = await groupService.searchGroup(
            pageSizeInt.toString(),
            pageNumberInt.toString(),
            name as string | undefined,
            genresArray as MusicGenre[]
        );

        res.status(200).json(groups);
    } catch (error: unknown) {
        logger.error("Search groups error: ", error);
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
