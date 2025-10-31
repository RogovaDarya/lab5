const healthCheck = require("../monitoring/health");

module.exports = function (app) {
  app.get("/health", async (req, res) => {
    const health = await healthCheck();
    const statusCode = health.status === "healthy" ? 200 : 503;

    res.status(statusCode).json(health);
  });

  app.get("/metrics", (req, res) => {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
    };

    res.json(metrics);
  });
};
