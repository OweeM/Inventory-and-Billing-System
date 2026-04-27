const isCashier = (req, res, next) => {
  if (req.user && req.user.role === "cashier") {
      return next();
  }
  return res.status(403).json({ message: "Access denied. Cashier role required." });
};

module.exports = { isCashier };
