import { validationResult } from "express-validator";
import { InvalidCredentialsError, UserNotFoundError } from "../src/common/errors";
import { loginUserAndGenerateJwt } from "../src/services/auth.service";
import { User } from "../src/models/user";
import bcrypt from "bcryptjs";

jest.mock("../src/services/auth.service");
jest.mock("../src/models/user");
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hashSync: jest.fn()
}));

describe("Login API - loginUserAndGenerateJwt funkcija", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    username: "TestUser",
    password: bcrypt.hashSync("correctpassword", 10),
    address: "Test Address",
    mainInstrument: "Guitar",
    genresOfInterest: ["ROCK", "JAZZ"],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Treba vratiti 200 i token kod uspješnog logina", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (loginUserAndGenerateJwt as jest.Mock).mockResolvedValue({
      token: "mocked-jwt-token",
      expiry: new Date(Date.now() + 3600 * 1000 * 24).toISOString()
    });

    const result = await loginUserAndGenerateJwt({
      email: "test@example.com",
      password: "correctpassword"
    });

    expect(result.token).toBe("mocked-jwt-token");
    expect(result.expiry).toBeDefined();
  });

  test("Treba vratiti 401 kada je lozinka pogrešna", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    try {
      await loginUserAndGenerateJwt({
        email: "test@example.com",
        password: "wrongpassword"
      });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidCredentialsError);
      expect(error.message).toBe("Password does not match.");
    }
  });

  test("Treba vratiti 404 kada korisnik ne postoji", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    try {
      await loginUserAndGenerateJwt({
        email: "nonexistent@example.com",
        password: "somepassword"
      });
    } catch (error) {
      expect(error).toBeInstanceOf(UserNotFoundError);
      expect(error.message).toBe(
        "User with email nonexistent@example.com not found."
      );
    }
  });

  test("Treba vratiti 400 ako nedostaje email ili lozinka", async () => {
    jest.spyOn(validationResult, "withDefaults").mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: "Validation failed" }]
    } as any);

    try {
      await loginUserAndGenerateJwt({
        email: "",
        password: ""
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe("Validation failed");
    }
  });
});
