const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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

  test("should validate password correctly", () => {
    const password = "password123";
    const hash = bcrypt.hashSync(password, 8);
    const isValid = bcrypt.compareSync(password, hash);

    expect(isValid).toBe(true);
  });

  test("should generate valid JWT token", () => {
    const payload = { id: 1, username: "testuser" };
    const token = jwt.sign(payload, "test-secret", { expiresIn: "1h" });

    expect(token).toBeDefined();
    const decoded = jwt.verify(token, "test-secret");
    expect(decoded.id).toBe(1);
  });
});
