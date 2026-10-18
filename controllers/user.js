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