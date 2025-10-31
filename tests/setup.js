process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "web_services_lab4";

jest.setTimeout(30000);

afterAll(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(), 500));
});
