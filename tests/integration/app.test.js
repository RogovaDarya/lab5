const request = require("supertest");
const app = require("../../server");

jest.mock("../../app/models", () => {
  const SequelizeMock = require("sequelize-mock");
  const dbMock = new SequelizeMock();

  const UserMock = dbMock.define("users", {
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
  });

  const RoleMock = dbMock.define("roles", {
    id: 1,
    name: "user",
  });

  const RefreshTokenMock = dbMock.define("refresh_tokens", {
    token: "mock-refresh-token",
    userId: 1,
    deviceId: "test-device",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  UserMock.belongsToMany = jest.fn();
  RoleMock.belongsToMany = jest.fn();
  RefreshTokenMock.belongsTo = jest.fn();

  return {
    sequelize: {
      sync: jest.fn().mockResolvedValue(true),
      authenticate: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(true),
    },
    user: UserMock,
    role: RoleMock,
    refreshToken: RefreshTokenMock,
    ROLES: ["user", "admin"],
    Sequelize: {
      Op: {
        or: jest.fn(),
      },
    },
  };
});

const db = require("../../app/models");

describe("API Integration Tests", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("Public Routes", () => {
    test("GET / should return welcome message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Test lab 4!");
    });

    test("GET /api/test/all should return public content", async () => {
      const response = await request(app).get("/api/test/all");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Test info lab4.");
    });

    test("GET /health should return health status", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("timestamp");
    });

    test("GET /metrics should return metrics", async () => {
      const response = await request(app).get("/metrics");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });
  });
});
