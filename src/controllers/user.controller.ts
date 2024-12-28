import logger from "@utils/logger";
import { Request, Response } from "express";
import { GetUserResponse, RegisterRequest, RegisterResponse } from "@interface/user";
import { registerUserAndGenerateJwt} from "@services/user.service";
import { ApiError, ApiValidationError } from "@common/errors";
import { validationResult } from "express-validator";
import { HttpStatusCode } from "@common/httpStatusCodes";
import { IRequestUser } from "@interface/auth";
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

export const getUser = async (req: IRequestUser, res: Response) => {
    try {

        console.log("User:", req.user);
        
        const {username, address, mainInstrument, genresOfInterest} = req.user;

        const getUserResponse: GetUserResponse = {username, address, mainInstrument, genresOfInterest};
        res.status(HttpStatusCode.OK).json(getUserResponse);
    } catch (error: unknown) {

        logger.error("Getting user error: ", error);
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

/*export const editProfile = async (req:IRequestUser, res: Response) => {
    try {
        const userId = req.user.userId;

        const { username, password, address, mainInstrument, genresOfInterest } = req.body;

        const updatedData: any = {}; 
        if (username) updatedData.username = username; 
        if (password) updatedData.password = password; 
        if (address) updatedData.address = address; 
        if (mainInstrument) updatedData.mainInstrument = mainInstrument; 
        if (genresOfInterest) updatedData.genresOfInterest = genresOfInterest;

        const [updatedRows] = await User.update(updatedData, {
             where: { id: userId }, 
             individualHooks: true 
        });

        if (updatedRows === 0) 
            { throw new ApiValidationError("User not found or no changes made.", []); }
    }
}*/