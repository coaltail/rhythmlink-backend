import logger from "@utils/logger";
import { Request, Response } from "express";
import { RegisterRequest, RegisterResponse } from "@interface/user";
import { registerUserAndGenerateJwt } from "@services/user.service";
import { ApiError, ApiValidationError } from "@common/errors";
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@common/httpStatusCodes";
export const registerUser = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiValidationError("Validation failed", errors.array());
        }

        const registerRequest: RegisterRequest = { ...req.body }
        const { token, expiry } = await registerUserAndGenerateJwt(registerRequest)

        const registerResponse: RegisterResponse = { token, expiry }
        res.status(HttpStatusCode.CREATED).json(registerResponse);
    } catch (error: unknown) {

        logger.error("Registration error: ", error);
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