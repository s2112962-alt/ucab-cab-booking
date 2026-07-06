const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const CAB_RATES = {
  Bike: { base: 20, perKm: 6, capacity: 1, arrival: [1, 4] },
  Mini: { base: 35, perKm: 9, capacity: 4, arrival: [2, 6] },
  Sedan: { base: 50, perKm: 12, capacity: 4, arrival: [3, 8] },
  SUV: { base: 70, perKm: 16, capacity: 6, arrival: [4, 10] },
};

const DRIVER_NAMES = ["Ravi Kumar", "Anil Sharma", "Priya Singh", "Mohammed Iqbal", "Sunita Rao", "Vikram Patel"];
const CITIES_FOR_MOCK_DISTANCE = {}; // placeholder for future real geocoding integration

function estimateDistanceKm(pickup, drop) {
  // Deterministic mock "distance" based on string lengths + hash,
  // so the same pickup/drop pair always returns the same distance.
  let hash = 0;
  const str = `${pickup.toLowerCase().trim()}|${drop.toLowerCase().trim()}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  const distance = 2 + (hash % 25) + (hash % 10) / 10; // between ~2km and ~27km
  return Math.round(distance * 10) / 10;
}

function randomVehicleNumber() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const rand = (n) => Math.floor(Math.random() * n);
  return `AP ${10 + rand(30)} ${letters[rand(letters.length)]}${letters[rand(letters.length)]} ${1000 + rand(9000)}`;
}

// @route POST /api/bookings/estimate
// Returns nearby cabs, fares, and ETAs for a given pickup/drop without creating a booking
router.post("/estimate", auth, async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    if (!pickup || !drop) {
      return res.status(400).json({ message: "Pickup and drop locations are required" });
    }

    const distanceKm = estimateDistanceKm(pickup, drop);

    const options = Object.entries(CAB_RATES).map(([type, rate]) => {
      const fare = Math.round(rate.base + rate.perKm * distanceKm);
      const eta = rate.arrival[0] + Math.floor(Math.random() * (rate.arrival[1] - rate.arrival[0] + 1));
      const nearbyCabs = 1 + Math.floor(Math.random() * 6);
      return {
        cabType: type,
        capacity: rate.capacity,
        fare,
        eta,
        nearbyCabs,
      };
    });

    res.json({ distanceKm, options });
  } catch (err) {
    res.status(500).json({ message: "Could not estimate fare", error: err.message });
  }
});

// @route POST /api/bookings
// Creates a new booking (books the ride)
router.post("/", auth, async (req, res) => {
  try {
    const {
      pickup,
      drop,
      cabType,
      donation = 0,
      refreshments = [],
      discountCode,
    } = req.body;

    if (!pickup || !drop || !cabType || !CAB_RATES[cabType]) {
      return res.status(400).json({ message: "Valid pickup, drop and cabType are required" });
    }

    const distanceKm = estimateDistanceKm(pickup, drop);
    const rate = CAB_RATES[cabType];
    let fare = Math.round(rate.base + rate.perKm * distanceKm);

    const refreshmentsTotal = refreshments.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

    let discountApplied = 0;
    if (discountCode && discountCode.toUpperCase() === "UCAB10") {
      discountApplied = Math.round(fare * 0.1);
    }

    const totalFare = fare + refreshmentsTotal + Number(donation) - discountApplied;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.walletBalance < totalFare) {
      return res.status(402).json({ message: "Insufficient wallet balance. Please top up your saved payment method." });
    }

    const eta = rate.arrival[0] + Math.floor(Math.random() * (rate.arrival[1] - rate.arrival[0] + 1));

    const booking = await Booking.create({
      user: user._id,
      pickup,
      drop,
      cabType,
      distanceKm,
      fare: totalFare,
      donation,
      refreshments,
      discountApplied,
      driverName: DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)],
      vehicleNumber: randomVehicleNumber(),
      eta,
      status: "DriverAssigned",
      paymentStatus: "Paid",
    });

    user.walletBalance -= totalFare;
    await user.save();

    res.status(201).json({ booking, walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: "Could not create booking", error: err.message });
  }
});

// @route GET /api/bookings
// Returns booking history for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch bookings", error: err.message });
  }
});

// @route PATCH /api/bookings/:id/status
// Simulates live ride progress: DriverAssigned -> OnTheWay -> Completed
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["OnTheWay", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Could not update booking", error: err.message });
  }
});

module.exports = router;
