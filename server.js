const express = require("express");
const cors = require("cors");

const app = express();

let corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

db.sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Drop and Resync Database with { force: true }");
    initial();
  })
  .catch((err) => {
    console.error("Database sync failed:", err.message);
    if (process.env.NODE_ENV === "test") {
      console.log("Continuing in test mode despite database issues");
    }
  });

app.get("/", (req, res) => {
  res.json({ message: "Test lab 4!" });
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/health.routes")(app);

const PORT = process.env.PORT || 8080;

module.exports = app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

function initial() {
  Role.create({
    id: 1,
    name: "user",
  }).catch((err) => {
    console.error("Error creating user role:", err.message);
  });

  Role.create({
    id: 2,
    name: "admin",
  }).catch((err) => {
    console.error("Error creating admin role:", err.message);
  });
}
