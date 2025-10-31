const request = require("supertest");
const app = require("../server");

describe("Health Check", () => {
  test("Server should be running", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  test("Health endpoint should return 200 with status information", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body.environment).toBe("test");
  });

  test("Metrics endpoint should work", async () => {
    const response = await request(app).get("/metrics");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("timestamp");
  });
});
