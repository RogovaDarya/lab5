const db = require("../app/models");

const healthCheck = async () => {
  const checks = {
    database: false,
    memory: false,
    disk: false,
  };

  try {
    await db.sequelize.authenticate();
    checks.database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  const used = process.memoryUsage();
  checks.memory = used.heapUsed / used.heapTotal < 0.8;

  const isHealthy = Object.values(checks).every((check) => check === true);

  return {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
  };
};

module.exports = healthCheck;
