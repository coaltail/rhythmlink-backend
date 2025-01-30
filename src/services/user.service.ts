import BlobService from "@common/blobService";
import { UserAlreadyExistsError } from "@common/errors";
import { Instrument, MusicGenre, User } from "@models/user";
import { EditProfileRequest, RegisterRequest } from "@interface/user";
import { TokenClaims } from "@interface/auth";
import { signJsonWebToken } from "@services/auth.service";

export const registerUserAndGenerateJwt = async (
  registerRequest: RegisterRequest
) => {
  const {
    email,
    username,
    password,
    address,
    mainInstrument,
    genresOfInterest
  } = registerRequest;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new UserAlreadyExistsError(
      `User with email ${email} already exists.`
    );
  }

  const newUser = await User.create({
    email,
    username,
    password,
    address,
    mainInstrument,
    genresOfInterest
  });

  const tokenClaims: TokenClaims = {
    userId: newUser.id,
    username: newUser.username,
    address: newUser.address,
    mainInstrument: newUser.mainInstrument,
    genresOfInterest: newUser.genresOfInterest,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };

  const token = signJsonWebToken(tokenClaims);
  const expiry = new Date(Date.now() + 3600 * 1000 * 24).toISOString();

  return { token, expiry };
};

export const findUserById = async (userId: number) => {
  const user = await User.findByPk(userId);
  return user;
};

export const editUserProfile = async (
  userId: number,
  username?: string,
  password?: string,
  address?: string,
  mainInstrument?: Instrument,
  genres?: Array<MusicGenre>,
  mainImage?: Express.Multer.File
) => {
  let mainImageUrl: string;

  const existingUser = await User.findByPk(userId);

  if (mainImage) {
    const blobService = BlobService.getInstance();
    const blobName = `users/${Date.now()}-${mainImage.originalname}`;

    mainImageUrl = await blobService.uploadBlob(blobName, mainImage.buffer);

    existingUser.mainImageUrl = mainImageUrl;
  }

  const updatedData: Partial<EditProfileRequest> = {};
  if (username) updatedData.username = username;
  if (password) updatedData.password = password;
  if (address) updatedData.address = address;
  if (mainInstrument) updatedData.mainInstrument = mainInstrument;
  if (genres) updatedData.genresOfInterest = genres;

  const tokenClaims: TokenClaims = {
    userId: userId,
    username: username || existingUser.username,
    address: address || existingUser.address,
    mainInstrument: mainInstrument || existingUser.mainInstrument,
    genresOfInterest: genres || existingUser.genresOfInterest,
    createdAt: existingUser.createdAt,
    updatedAt: new Date(),
    mainImageUrl: mainImageUrl || existingUser.mainImageUrl
  };

  const token = signJsonWebToken(tokenClaims);
  const expiry = new Date(Date.now() + 3600 * 1000 * 24).toISOString();

  await existingUser.update(updatedData);

  return { token, expiry };
};
