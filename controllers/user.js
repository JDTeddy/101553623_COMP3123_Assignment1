
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const httpError = require("../utils/httpError");

// POST /api/v1/user/signup -> 201
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.validated;

    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] }).select("username email");
    if (existingUser) {
      const field = existingUser.username === username ? "username" : "email";
      throw httpError(409, `A user with this ${field} already exists.`);
    }

    // Hash the password BEFORE saving.
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully.", user: newUser });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/user/login -> 200 (username + password OR email + password)
exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.validated;

    // Find the user by username OR email
    const conditions = [];
    if (username) conditions.push({ username });
    if (email) conditions.push({ email });
    const user = await User.findOne({ $or: conditions }).select("+password");

    // compare against the bcrypt hash instead.
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

    // Same message for "no such user" and "wrong password" so attackers cannot tell them apart
    if (!isPasswordValid) {
      throw httpError(401, "Invalid credentials.");
    }

    // Generate a JWT token: it only carries the user id and an expiry
    const token = jwt.sign({ id: user._id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.status(200).json({ message: "Login successful.", token });
  } catch (err) {
    next(err);
  }
};