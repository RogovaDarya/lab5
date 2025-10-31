const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { signup, signin } = require("../../app/controllers/auth.controller");
const db = require("../../app/models");

jest.mock("../../app/models", () => ({
  user: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  role: {
    findAll: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
  },
  Sequelize: {
    Op: {
      or: jest.fn(),
    },
  },
}));

describe("Auth Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create user successfully", async () => {
    const mockUser = {
      setRoles: jest.fn().mockResolvedValue(true),
    };

    db.user.create.mockResolvedValue(mockUser);
    db.role.findAll.mockResolvedValue([]);

    const req = {
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await signup(req, res);

    expect(db.user.create).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: expect.any(String),
    });
    expect(res.send).toHaveBeenCalledWith({
      message: "User registered successfully!",
    });
  });

  test("should validate password correctly", () => {
    const password = "password123";
    const hash = bcrypt.hashSync(password, 8);
    const isValid = bcrypt.compareSync(password, hash);

    expect(isValid).toBe(true);
  });
});
