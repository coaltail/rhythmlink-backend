import { UserAlreadyExistsError } from "@common/errors";
import { User } from "@models/user";
import { RegisterRequest } from "@interface/user";
import { TokenClaims } from "@interface/auth";
import { signJsonWebToken } from "@services/auth.service"
export const registerUserAndGenerateJwt = async (registerRequest: RegisterRequest) => {
    const { email, username, password, address, mainInstrument, genresOfInterest } = registerRequest;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new UserAlreadyExistsError(`User with email ${email} already exists.`);
    }

    const newUser = await User.create({
        email,
        username,
        password,
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

export const findUserById = async (userId: number) => {
    const user = await User.findByPk(userId)
    return user;
}
