import logger from "@utils/logger";
import { Request, Response } from "express";
import { LoginRequest, LoginResponse } from "@interface/auth";
import { loginUserAndGenerateJwt } from "@services/auth.serivce";
import { ApiError, ApiValidationError } from "@common/errors";
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@common/httpStatusCodes";
export const loginUser = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }

        const loginRequest: LoginRequest = { ...req.body }
        const { token, expiry } = await loginUserAndGenerateJwt(loginRequest)

        const loginResponse: LoginResponse = { token, expiry }
        res.status(HttpStatusCode.OK).json(loginResponse);
    } catch (error: unknown) {

        logger.error("Login error: ", error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                message: error.message,
                ...(error instanceof ApiValidationError && { errors: error.errors })
            })
        }
        res.status(500).json({ message: "Internal server error" });

    }
}