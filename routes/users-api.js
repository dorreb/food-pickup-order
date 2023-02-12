/*
 * All routes for User Data are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /api/users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require("express");
const router = express.Router();
const userQueries = require("../db/queries/users");
const restaurantQueries = require("../db/queries/esther");

router.get("/", (req, res) => {
  userQueries
    .getUsers()
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/preptime", (req, res) => {
  // const userId = req.session.userId;
  const userId = true;
  if (userId) {
    restaurantQueries
      .editPreptime(1, 40)
      .then((order) => {
        res.json({ order });
      })
      .catch((e) => {
        console.error(e);
        res.send(e);
      });
  }
});

router.get("/cancel", (req, res) => {
  // const userId = req.session.userId;
  const userId = true;
  if (userId) {
    restaurantQueries
      .cancelOrder(1)
      .then((order) => {
        res.json({ order });
      })
      .catch((e) => {
        console.error(e);
        res.send(e);
      });
  }
});

router.get("/ready", (req, res) => {
  // const userId = req.session.userId;
  const userId = true;
  if (userId) {
    restaurantQueries
      .readyOrder(1)
      .then((order) => {
        res.json({ order });
      })
      .catch((e) => {
        console.error(e);
        res.send(e);
      });
  }
});

router.get("/complete", (req, res) => {
  // const userId = req.session.userId;
  const userId = true;
  if (userId) {
    restaurantQueries
      .completeOrder(1)
      .then((order) => {
        res.json({ order });
      })
      .catch((e) => {
        console.error(e);
        res.send(e);
      });
  }
});

module.exports = router;
