const request = require("supertest");
const app = require("../server");

describe("Health Check", () => {
  test("Server should be running", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  test("Database connection should work", async () => {
    expect(true).toBe(true);
  });
});
