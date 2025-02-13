import { validationResult } from "express-validator";
import { UserAlreadyExistsError } from "../src/common/errors";
import { registerUserAndGenerateJwt } from "../src/services/user.service";
import { User, Instrument, MusicGenre } from "../src/models/user";
import { signJsonWebToken } from "../src/services/auth.service";
import bcrypt from "bcryptjs";

jest.mock("../src/services/auth.service", () => ({
    signJsonWebToken: jest.fn().mockReturnValue("mocked-jwt-token")
  }));

jest.mock("../src/models/user");

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn().mockReturnValue("hashedPassword")
}));

describe("Register API - registerUserAndGenerateJwt funkcija", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    username: "TestUser",
    password: "hashedPassword",
    address: "Test Address",
    mainInstrument: Instrument.GUITAR,
    genresOfInterest: [MusicGenre.ROCK, MusicGenre.JAZZ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Treba vratiti 201 i token kod uspješne registracije", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null); 
    User.create = jest.fn().mockResolvedValue(mockUser);
  
    const result = await registerUserAndGenerateJwt({
      email: "test@example.com",
      username: "TestUser",
      password: "hashedPassword",
      address: "Test Address",
      mainInstrument: Instrument.GUITAR,
      genresOfInterest: [MusicGenre.ROCK, MusicGenre.JAZZ],
    });
  
    expect(result.token).toBe("mocked-jwt-token");
    expect(result.expiry).toBeDefined();
  
    expect(User.create).toHaveBeenCalledTimes(1); 
    expect(User.create).toHaveBeenCalledWith({
      email: "test@example.com",
      username: "TestUser",
      password: "hashedPassword", 
      address: "Test Address",
      mainInstrument: Instrument.GUITAR,
      genresOfInterest: [MusicGenre.ROCK, MusicGenre.JAZZ],
    });

    expect(signJsonWebToken).toHaveBeenCalledTimes(1);
    expect(signJsonWebToken).toHaveBeenCalledWith({
    userId: mockUser.id,
    username: mockUser.username,
    address: mockUser.address,
    mainInstrument: mockUser.mainInstrument,
    genresOfInterest: mockUser.genresOfInterest,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt})
  });
  

  test("Treba baciti UserAlreadyExistsError ako korisnik već postoji", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    try {
      await registerUserAndGenerateJwt({
        email: "test@example.com",
        username: "TestUser",
        password: "somepassword",
        address: "Test Address",
        mainInstrument: Instrument.GUITAR,
        genresOfInterest: [MusicGenre.ROCK, MusicGenre.JAZZ],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(UserAlreadyExistsError);
      expect(error.message).toBe("User with email test@example.com already exists.");
    }

    expect(User.create).not.toHaveBeenCalled();
  });

  test("Treba baciti grešku ako nedostaje neki od podataka", async () => {
    jest.spyOn(validationResult, "withDefaults").mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Validation failed" }]
    } as any);

    try {
      await registerUserAndGenerateJwt({
        email: "",
        username: "",
        password: "",
        address: "",
        mainInstrument: null,
        genresOfInterest: []
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe("User with email  already exists.");
    }
  });
});
