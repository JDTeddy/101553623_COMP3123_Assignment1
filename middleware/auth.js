const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("../config/env");
const User = require("../models/user");
const httpError = require("../utils/httpError");
const logger = require("../utils/logger");


//  - uses our central error handler (next(err)) so every error has the same JSON shape
//  - invalid / expired tokens are 401 (not 403): 401 = "who are you?", 403 = "you may not do that"
//  - the user is loaded from the database, so a token for a deleted user stops working
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn("auth.token.missing", { path: req.originalUrl, ip: req.ip });
      throw httpError(401, "No token provided");
    }

    // authorization: Bearer TOKEN
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      logger.warn("auth.token.missing", { path: req.originalUrl, ip: req.ip });        
      throw httpError(401, "No token provided");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        logger.warn("auth.token.expired", { path: req.originalUrl, ip: req.ip });       
        throw httpError(401, "Token expired");
      }
      logger.warn("auth.token.invalid", { path: req.originalUrl, ip: req.ip });       
      throw httpError(401, "Invalid token");
    }

    // The user's identity comes ONLY from the signed token, never from the request body or URL
    const user = mongoose.Types.ObjectId.isValid(decoded.id) ? await User.findById(decoded.id) : null;
    if (!user) {
      logger.warn("auth.token.unknown_user", { path: req.originalUrl, ip: req.ip });
      throw httpError(401, "Invalid token");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticateToken;