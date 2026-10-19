// Creates an Error that also carries an HTTP status code.
// The error-handling middleware reads err.status to decide what to send back.
function httpError(status, message, errors) {
  const err = new Error(message);
  err.status = status;
  if (errors) err.errors = errors; // optional list of field-level problems
  return err;
}

module.exports = httpError;