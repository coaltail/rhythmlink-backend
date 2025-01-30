import logger from "@utils/logger";
import { Request, Response } from "express";
import {
  GetUserResponse,
  RegisterRequest,
  RegisterResponse,
  EditProfileRequest
} from "@interface/user";
import {
  registerUserAndGenerateJwt,
  editUserProfile
} from "@services/user.service";
import { ApiError, ApiValidationError } from "@common/errors";
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@common/httpStatusCodes";
import { IRequestUser } from "@interface/auth";
import { MusicGenre } from "@models/user";
export const registerUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ApiValidationError("Validation failed", errors.array());
    }

    const registerRequest: RegisterRequest = { ...req.body };
    const { token, expiry } = await registerUserAndGenerateJwt(registerRequest);

    const registerResponse: RegisterResponse = { token, expiry };
    res.status(HttpStatusCode.CREATED).json(registerResponse);
  } catch (error: unknown) {
    logger.error("Registration error: ", error);
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

export const getUser = async (req: IRequestUser, res: Response) => {
  try {
    const {
      userId,
      username,
      address,
      mainInstrument,
      genresOfInterest,
      mainImageUrl
    } = req.user;

    const getUserResponse: GetUserResponse = {
      userId,
      username,
      address,
      mainInstrument,
      genresOfInterest,
      mainImageUrl
    };

    res.status(HttpStatusCode.OK).json(getUserResponse);
  } catch (error: unknown) {
    logger.error("Getting user error: ", error);
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

export const editProfile = async (req: IRequestUser, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ApiValidationError("Validation failed", errors.array());
    }

    //const { userData } = (req.body.nameValuePairs || req.body)
    const userData = req.body.userData;
    const mainImage = req.file;
    const data: EditProfileRequest = JSON.parse(userData);

    if (mainImage) {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedImageTypes.includes(mainImage.mimetype)) {
        throw new ApiValidationError(
          "Invalid image type. Only JPG, PNG, and JPEG are allowed.",
          []
        );
      }
    }

    const userId = req.user.userId;

    const genreArray: Array<MusicGenre> = data.genresOfInterest;

    const { token, expiry } = await editUserProfile(
      userId,
      data.username,
      data.password,
      data.address,
      data.mainInstrument,
      genreArray,
      mainImage
    );

    res.status(HttpStatusCode.OK).json({ token, expiry });
  } catch (error: unknown) {
    logger.error("Editing user error: ", error);
    console.error(error);
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
