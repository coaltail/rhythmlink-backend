import { InvalidCredentialsError, UserNotFoundError } from "@common/errors";
import { User } from "@models/user";
import { LoginRequest, TokenClaims } from "@interface/auth";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from "@utils/logger";

export const loginUserAndGenerateJwt = async (loginRequest: LoginRequest) => {
    const { email, password } = loginRequest;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new UserNotFoundError(`User with email ${email} not found.`);
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new InvalidCredentialsError("Password does not match.");
    }
    const tokenClaims: TokenClaims = {
        userId: user.id,
        username: user.username,
        address: user.address,
        mainInstrument: user.mainInstrument,
        genresOfInterest: user.genresOfInterest,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    const token = signJsonWebToken(tokenClaims);
    const expiry = new Date(Date.now() + 3600 * 1000 * 24).toISOString();

    return { token, expiry };

}

export const signJsonWebToken = (claims: TokenClaims) => {
    logger.info(`JWT SECRET: ${process.env.JWT_SECRET}`)
    return jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: "24h" })
}