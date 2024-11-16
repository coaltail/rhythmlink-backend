import { UserAlreadyExistsError} from "@common/errors";
import { User } from "@models/user";
import { RegisterRequest, TokenClaims } from "@interface/user";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const registerUserAndGenerateJwt = async (registerRequest: RegisterRequest) => {
    const {email, username, password, address, mainInstrument, genresOfInterest} = registerRequest;

    const user = await User.findOne({ where: { email } });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new UserAlreadyExistsError(`User with email ${email} already exists.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email,
        username,
        password: hashedPassword,
        address,
        mainInstrument,
        genresOfInterest,
    });

    const tokenClaims: TokenClaims = {
        userId: newUser.id,
        username: newUser.username,
        address: newUser.address,
        mainInstrument: newUser.mainInstrument,
        genresOfInterest: newUser.genresOfInterest,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
    };

    const token = signJsonWebToken(tokenClaims);
    const expiry = new Date(Date.now() + 3600 * 1000 * 24).toISOString();

    return { token, expiry };

}

export const signJsonWebToken = (claims: TokenClaims) => {
    return jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: "24h" })
}