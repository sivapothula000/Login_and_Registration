const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.json(user.rows[0]);

  } catch (err) {
    console.error(err.message);
  }

}
);

const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.json("User not found");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.json("Wrong password");
    }

    const token = jwt.sign(
      { user: user.rows[0].id },
      "secretkey"
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
  }

});

module.exports = router;