import { useEffect, useState } from "react";
import api from "../api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/bookings")])
      .then(([statsRes, usersRes, bookingsRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBookings(bookingsRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load admin data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="section-title" style={{ fontSize: 26 }}>
        Admin dashboard
      </h1>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="cab-grid" style={{ marginBottom: 28 }}>
          <div className="cab-card" style={{ cursor: "default" }}>
            <div className="cab-meta">Total users</div>
            <div className="cab-fare">{stats.userCount}</div>
          </div>
          <div className="cab-card" style={{ cursor: "default" }}>
            <div className="cab-meta">Total bookings</div>
            <div className="cab-fare">{stats.bookingCount}</div>
          </div>
          <div className="cab-card" style={{ cursor: "default" }}>
            <div className="cab-meta">Active rides</div>
            <div className="cab-fare">{stats.activeRides}</div>
          </div>
          <div className="cab-card" style={{ cursor: "default" }}>
            <div className="cab-meta">Total revenue</div>
            <div className="cab-fare">₹{stats.totalRevenue}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button className={tab === "bookings" ? "nav-cta" : "small-btn"} onClick={() => setTab("bookings")}>
          All bookings
        </button>
        <button className={tab === "users" ? "nav-cta" : "small-btn"} onClick={() => setTab("users")}>
          All users
        </button>
      </div>

      {loading ? (
        <p className="history-meta">Loading...</p>
      ) : tab === "bookings" ? (
        bookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings have been made yet.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div className="history-item" key={b._id}>
              <div>
                <div className="history-route">
                  {b.pickup} → {b.drop}
                </div>
                <div className="history-meta">
                  {b.user?.name || "Unknown user"} ({b.user?.email || "—"}) · {b.cabType} · {b.distanceKm} km ·{" "}
                  {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="cab-fare" style={{ fontSize: 18 }}>
                  ₹{b.fare}
                </div>
                <span className={`status-badge ${b.status}`}>{b.status.replace(/([A-Z])/g, " $1").trim()}</span>
              </div>
            </div>
          ))
        )
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      ) : (
        users.map((u) => (
          <div className="history-item" key={u._id}>
            <div>
              <div className="history-route">
                {u.name} {u.isAdmin && <span className="badge-discount">Admin</span>}
              </div>
              <div className="history-meta">
                {u.email} · {u.phone || "No phone"} · Joined {new Date(u.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="cab-fare" style={{ fontSize: 18 }}>
              ₹{u.walletBalance}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
