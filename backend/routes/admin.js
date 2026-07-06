const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// All admin routes require a valid login AND isAdmin === true
router.use(auth, adminOnly);

// @route GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [userCount, bookingCount, bookings] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.find(),
    ]);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.fare || 0), 0);
    const activeRides = bookings.filter((b) => ["Requested", "DriverAssigned", "OnTheWay"].includes(b.status)).length;

    res.json({ userCount, bookingCount, totalRevenue, activeRides });
  } catch (err) {
    res.status(500).json({ message: "Could not load stats", error: err.message });
  }
});

// @route GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not load users", error: err.message });
  }
});

// @route GET /api/admin/bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not load bookings", error: err.message });
  }
});

module.exports = router;
