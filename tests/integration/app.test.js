const request = require("supertest");
const app = require("../../server");
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
  });

  describe("Authentication Routes", () => {
    test("POST /api/auth/signup should register user", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("successfully");
    });

    test("POST /api/auth/signin should authenticate user", async () => {
      const credentials = {
        username: "testuser",
        password: "password123",
        deviceId: "test-device",
      };

      const response = await request(app)
        .post("/api/auth/signin")
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.username).toBe("testuser");
    });
  });
});
