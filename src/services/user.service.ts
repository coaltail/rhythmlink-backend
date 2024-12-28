import { UserAlreadyExistsError} from "@common/errors";
import { User } from "@models/user";
import { GetUserRequest, RegisterRequest} from "@interface/user";
import { TokenClaims } from "@interface/auth";
import {signJsonWebToken} from "@services/auth.serivce"
import jwt, {JwtPayload} from 'jsonwebtoken';

export const registerUserAndGenerateJwt = async (registerRequest: RegisterRequest) => {
    const {email, username, password, address, mainInstrument, genresOfInterest} = registerRequest;

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
   

export const getUserFromToken = async (getUserRequest: GetUserRequest) => {
    const { token } = getUserRequest;

    const userClaims = decodeToken(token);

    if (!userClaims) {
        throw new Error('Invalid token');
    }

    if (typeof userClaims === 'object') {
        return {
            username: userClaims.username,
            address: userClaims.address,
            mainInstrument: userClaims.mainInstrument,
            genresOfInterest: userClaims.genresOfInterest,
        };
    } else {
        throw new Error('Invalid token payload');
    }
};


export const decodeToken = (token: string): JwtPayload | null => { 
    try { const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        return decoded as JwtPayload; 
    } catch (error) { 
        console.error('Error decoding token:', error); return null; 
    } 
};
