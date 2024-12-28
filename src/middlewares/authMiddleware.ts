import { IRequestUser, TokenClaims } from "@interface/auth";
import jwt from "jsonwebtoken"
import { Response, NextFunction } from "express";
import { HttpStatusCode } from "@common/httpStatusCodes";
export const checkJwtMiddleware = (req: IRequestUser, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    console.log("Token:", token);

    if (!token) {
        res.status(HttpStatusCode.UNATHORIZED).json({ message: "No token provided, authorization denied." });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(HttpStatusCode.FORBIDDEN).json({ message: "Invalid or expired token." });
            return;
        }

        console.log("Decoded:", decoded);

        req.user = decoded as TokenClaims;
       
        next();
    });
};