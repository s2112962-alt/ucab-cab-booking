const User = require("../models/User");

// Must run after the regular auth middleware (expects req.userId to be set)
module.exports = async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Could not verify admin access", error: err.message });
  }
};
