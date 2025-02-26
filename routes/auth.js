const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/authMiddleware");

// Environment variables for secret key
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed. User not found." });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    // Set token expiration based on "Remember Me" checkbox
    const expiresIn = rememberMe ? "30d" : "1h"; // Extended to 30 days if "Remember Me" is checked, otherwise 1 hour

    // Sign the JWT
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: expiresIn,
    });

    // Send success response
    res.json({ message: "Authentication successful", token: token }); // Consider security implications of sending token in JSON
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

function isPasswordValid(password) {
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: `Password must include an uppercase letter}.`,
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: `Password must include an lowercase letter}.`,
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: `Password must include a number}.`,
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: `Password must include a special character}.`,
    };
  }
  if (password.length < 8) {
    return {
      valid: false,
      message: `Password must be at least 8 characters}.`,
    };
  }

  return { valid: true };
}

// Register Route
router.post("/register", async (req, res) => {
  const { firstname, lastname, email, username, password } = req.body;

  if (!isPasswordValid(password)) {
    const passwordValidation = isPasswordValid(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstname,
    lastname,
    email,
    username,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    // Optionally, auto-login user after registration or simply return success message
    const token = jwt.sign({ userId: newUser._id }, secretKey, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({ message: "User registered successfully", token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/auth", authenticateToken, (req, res) => {
  res.status(200);
});

module.exports = router;
