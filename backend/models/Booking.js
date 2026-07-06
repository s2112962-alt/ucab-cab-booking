const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    cabType: { type: String, enum: ["Mini", "Sedan", "SUV", "Bike"], required: true },
    distanceKm: { type: Number, required: true },
    fare: { type: Number, required: true },
    donation: { type: Number, default: 0 },
    refreshments: [{ item: String, price: Number }],
    discountApplied: { type: Number, default: 0 },
    driverName: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    eta: { type: Number, default: 0 }, // minutes
    status: {
      type: String,
      enum: ["Requested", "DriverAssigned", "OnTheWay", "Completed", "Cancelled"],
      default: "Requested",
    },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
