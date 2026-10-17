const httpError = require("../utils/httpError");

// Runs when no route matched: create a 404 error and pass it on to the error handler.
exports.notFound = (req, res, next) => {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl.split("?")[0]}`));
};

// Error handling middleware
// Express knows it is an error handler because it has FOUR parameters.
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  let errors;

  if (Array.isArray(err.errors)) errors = err.errors;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Request body contains malformed JSON.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  }

  if (status >= 500) {
    console.error(err); // full details stay on the server...
    message = "Something went wrong on our side."; // ...and are never sent to the client
  }

  const body = {
    status: false,
    error: true,
    code: status,
    message: message,
    date: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};