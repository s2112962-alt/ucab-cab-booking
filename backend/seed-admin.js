// One-time script to create (or reset) the admin account.
// Run with: node seed-admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ucab.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = "Ucab Admin";

async function run() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ucab";
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    existing.isAdmin = true;
    existing.password = hashed;
    await existing.save();
    console.log(`Existing user ${ADMIN_EMAIL} was promoted to admin and password reset.`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      isAdmin: true,
      walletBalance: 0,
    });
    console.log(`Admin account created: ${ADMIN_EMAIL}`);
  }

  console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
