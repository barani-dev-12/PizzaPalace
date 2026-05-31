/**
 * Parse multipart pizza form fields into the types expected by validators/controllers.
 */
const parsePizzaForm = (req, _res, next) => {
  if (typeof req.body.sizes === "string") {
    try {
      req.body.sizes = JSON.parse(req.body.sizes);
    } catch {
      req.body.sizes = [];
    }
  }

  if (typeof req.body.prices === "string") {
    try {
      req.body.prices = JSON.parse(req.body.prices);
    } catch {
      req.body.prices = {};
    }
  }

  if (req.body.isAvailable !== undefined) {
    req.body.isAvailable =
      req.body.isAvailable === true ||
      req.body.isAvailable === "true";
  }

  next();
};

module.exports = parsePizzaForm;
