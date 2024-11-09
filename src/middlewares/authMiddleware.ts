import { IRequestUser, TokenClaims } from "@interface/auth";
import jwt from "jsonwebtoken"
import { Response, NextFunction } from "express";
import { HttpStatusCode } from "@common/httpStatusCodes";
export const checkJwtMiddleware = (req: IRequestUser, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split("")[1];

    if (!token) {
        return res.status(HttpStatusCode.UNATHORIZED).json({ message: "No token provided, authorization denied." });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, decoded) => {
        if (err) {
            return res.status(HttpStatusCode.FORBIDDEN).json({ message: "Invalid or expired token." });
        }

        req.user = decoded as TokenClaims;
        next();
    });
};