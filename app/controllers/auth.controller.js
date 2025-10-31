const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const accessToken = jwt.sign({ id: user.id }, config.secret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 900, // 15 minutes
      });

      const refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400, // 24 hours
      });

      const deviceId = req.body.deviceId || "default";

      RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        deviceId: deviceId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      const authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: accessToken,
          refreshToken: refreshToken,
          deviceId: deviceId,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.refreshToken = (req, res) => {
  const { refreshToken, deviceId } = req.body;

  if (!refreshToken) {
    return res.status(403).send({ message: "Refresh Token is required!" });
  }

  RefreshToken.findOne({
    where: {
      token: refreshToken,
      deviceId: deviceId || "default",
    },
    include: [
      {
        model: User,
        as: "user",
      },
    ],
  })
    .then((token) => {
      if (!token) {
        return res.status(403).send({ message: "Invalid refresh token!" });
      }

      if (token.expiresAt < new Date()) {
        return res.status(403).send({ message: "Refresh token expired!" });
      }

      jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Invalid refresh token!" });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, config.secret, {
          algorithm: "HS256",
          allowInsecureKeySizes: true,
          expiresIn: 900, // 15 minutes
        });

        const newRefreshToken = jwt.sign(
          { id: decoded.id },
          config.refreshSecret,
          {
            algorithm: "HS256",
            allowInsecureKeySizes: true,
            expiresIn: 86400, // 24 hours
          }
        );

        token.update({
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        res.status(200).send({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUserDevices = (req, res) => {
  RefreshToken.findAll({
    where: {
      userId: req.userId,
      expiresAt: {
        [db.Sequelize.Op.gt]: new Date(),
      },
    },
    attributes: ["id", "deviceId", "createdAt", "expiresAt"],
  })
    .then((devices) => {
      res.status(200).send(devices);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.logoutDevice = (req, res) => {
  const { deviceId } = req.body;

  RefreshToken.destroy({
    where: {
      userId: req.userId,
      deviceId: deviceId,
    },
  })
    .then(() => {
      res.status(200).send({ message: "Successfully logged out from device" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.logoutOtherDevices = (req, res) => {
  const currentDeviceId = req.body.currentDeviceId;

  RefreshToken.destroy({
    where: {
      userId: req.userId,
      deviceId: {
        [db.Sequelize.Op.ne]: currentDeviceId,
      },
    },
  })
    .then(() => {
      res
        .status(200)
        .send({ message: "Successfully logged out from other devices" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
