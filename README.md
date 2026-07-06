# Ucab — Cab Booking App (MERN Stack)

Ucab is a simple, easy-to-use cab booking app. Users can log in, choose pickup/drop-off
locations, pick a cab type, see nearby cabs with fares and ETAs, book a ride, track its
status, add refreshments or a donation, apply a discount code, and view booking history.

## 🔗 Project links
> Update these before submitting to your mentor.

- **Live demo:** _add your deployed frontend URL here (e.g. Vercel/Netlify link)_
- **GitHub repository:** _add your GitHub repo URL here_
- **Backend API (if deployed separately):** _add your Render/Railway API URL here_

## Tech stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing

## Features implemented
- Register / login with JWT authentication
- Pickup & drop-off entry with fare + ETA estimation for 4 cab types (Bike, Mini, Sedan, SUV)
- Nearby cab count and per-type capacity
- Wallet-based automatic payment (mock "saved payment method")
- Discount codes (try `UCAB10` for 10% off)
- Optional donation add-on and in-ride refreshments
- Simulated real-time ride status tracking (Driver Assigned → On The Way → Completed)
- Booking history page

## Project structure
```
ucab/
├── backend/          # Express + MongoDB API
│   ├── models/        # User, Booking schemas
│   ├── routes/        # auth.js, booking.js
│   ├── middleware/     # JWT auth middleware
│   └── server.js
└── frontend/         # React (Vite) client
    └── src/
        ├── pages/       # Login, Register, Home (booking), History
        ├── components/  # Navbar, CabCard, ProtectedRoute
        └── context/     # AuthContext
```

## Admin panel
There's a lightweight admin dashboard for viewing all users and all bookings (not
just your own). Regular sign-ups are never admins by default — you create the admin
account once via a seed script:

```bash
cd backend
npm run seed:admin
```

This creates (or promotes) an account using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values
in your `backend/.env` (defaults: `admin@ucab.com` / `Admin@123` if you don't set them).
Log in with those credentials on the normal login page — an **Admin** link will appear
in the navbar, leading to `/admin`, which shows total users, total bookings, revenue,
active rides, and full lists of both.

## Getting started locally

### 1. Backend
```bash
cd backend
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET if needed
npm install
npm run dev              # starts on http://localhost:5000
```
Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas connection string).

### 2. Frontend
```bash
cd frontend
cp .env.example .env    # points to the backend API
npm install
npm run dev              # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a new account (you start with a ₹500 wallet
balance), and book your first ride.

## Deploying for your mentor to review
A common free setup:
1. Push this project to a **GitHub** repo — paste that link above.
2. Deploy `backend/` to **Render** or **Railway**, with a MongoDB Atlas connection string
   as `MONGO_URI`.
3. Deploy `frontend/` to **Vercel** or **Netlify**, setting `VITE_API_URL` to your deployed
   backend URL + `/api`.
4. Paste both live links at the top of this README so your mentor can click straight through.

## Notes on this build
Distance and geolocation are currently mocked (deterministically derived from the pickup/
drop text) rather than pulled from a live maps API, so the app runs without needing a paid
maps key. Swapping in Google Maps Distance Matrix or Mapbox Directions API would be the
natural next step for production use.
