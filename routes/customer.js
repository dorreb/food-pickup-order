const express = require("express");
const router = express.Router();

router.get("/menu", (req, res) => {
  res.render("menu", { owner: false });
});

router.get("/status", (req, res) => {
  res.render("status", { owner: false });
});

module.exports = router;
