import {
  GroupCreateRequest,
  GroupCreateResponse,
  GroupGetResponse
} from "@interface/group";
import { Request, Response } from "express";
import logger from "@utils/logger";
import { validationResult } from "express-validator";
import * as userService from "@services/user.service";
import {
  ApiError,
  ApiValidationError,
  UserNotFoundError
} from "@common/errors";
import { MusicGenre } from "@models/user";
import * as groupService from "@services/group.service";
import { IRequestUser } from "@interface/auth";
import { HttpStatusCode } from "@common/httpStatusCodes";

export const createNewGroup = async (
  req: IRequestUser,
  res: Response<GroupCreateResponse | { message: string }>
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiValidationError("Validation failed", errors.array());
    }
    const { groupData } = req.body;
    const mainImage = req.file;
    const data: GroupCreateRequest = JSON.parse(groupData);
    const owner = userService.findUserById(data.ownerId);
    if (!owner) {
      throw new UserNotFoundError(`Owner with id ${data.ownerId} not found.`);
    }
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedImageTypes.includes(mainImage.mimetype)) {
      throw new ApiValidationError(
        "Invalid image type. Only JPG, PNG, and JPEG are allowed.",
        []
      );
    }

    const userId = req.user.userId;
    if (userId != data.ownerId) {
      throw new ApiValidationError(
        "Cannot use another owner as a group owner.",
        []
      );
    }

    const genreArray: Array<MusicGenre> = data.genres;
    const newGroup = await groupService.createNewGroup(
      data.ownerId,
      data.name,
      genreArray,
      mainImage
    );
    res.status(201).json(newGroup);
  } catch (error: unknown) {
    logger.error("Create new group error: ", error);
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

export const getGroup = async (
  req: IRequestUser,
  res: Response<GroupGetResponse | { message: string }>
) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid group ID." });
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

export const getGroupsByUser = async (req: IRequestUser, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid user ID." });
      return;
    }

    const groups = await groupService.getGroupsByUser(id);

    res.status(HttpStatusCode.OK).json(groups);
  } catch (error: unknown) {
    logger.error("Getting user groups error: ", error);
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

export const getGroupRequests = async (req: IRequestUser, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ownerId = parseInt(req.params.ownerId, 10);

    if (isNaN(id || ownerId)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid group or owner ID." });
      return;
    }

    const groupRequests = await groupService.getGroupRequests(id, ownerId);

    res.status(HttpStatusCode.OK).json(groupRequests);
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
        throw new ApiValidationError(
          "Genres parameter must be a valid JSON array",
          []
        );
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

export const trainModel = async (_: Request, _unused: Response) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const response = await fetch("http://localhost:5000/train", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to train model: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Model trained:", data);
  } catch (error: unknown) {
    console.error("Error training model: ", error);
  }
};

export const getRecommendations = async (req: IRequestUser, res: Response) => {
  try {
    const userId = req.user.userId
    const response = await groupService.getRecommendations(userId);
    console.log("Recommendations:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json(error);
    return;
  }
};
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const group_id = parseInt(req.params.id, 10);
    const user_id = req.body.userId;

    if (isNaN(group_id)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid group ID." });
      return;
    }

    const joinGroupResponse = await groupService.joinGroup(group_id, user_id);

    res.status(HttpStatusCode.OK).json(joinGroupResponse);
  } catch (error: unknown) {
    logger.error("Joining group error: ", error);
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

export const updateGroupRequest = async (req: IRequestUser, res: Response) => {
  try {
    const group_id = parseInt(req.params.id, 10);
    const user_id = req.body.userId;
    const action = req.body.action;
    const owner_id = req.body.ownerId;

    if (isNaN(group_id)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: "Invalid group ID." });
      return;
    }

    if (action == "accept") {
      const acceptJoinResponse = await groupService.acceptJoinRequest(
        group_id,
        user_id,
        owner_id
      );

      res.status(HttpStatusCode.OK).json(acceptJoinResponse);
    } else if (action == "deny") {
      await groupService.denyJoinRequest(group_id, user_id, owner_id);
      res.status(HttpStatusCode.OK).json("Request denied");
    }
  } catch (error: unknown) {
    logger.error("Updating request error: ", error);
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
