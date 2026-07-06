import { useEffect, useState } from "react";
import api from "../api";

export default function History() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bookings")
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load booking history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="section-title" style={{ fontSize: 26 }}>
        Your ride history
      </h1>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="history-meta">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>No rides yet. Once you book a ride, it'll show up here.</p>
        </div>
      ) : (
        bookings.map((b) => (
          <div className="history-item" key={b._id}>
            <div>
              <div className="history-route">
                {b.pickup} → {b.drop}
              </div>
              <div className="history-meta">
                {new Date(b.createdAt).toLocaleString()} · {b.cabType} · {b.distanceKm} km
                {b.driverName ? ` · ${b.driverName}` : ""}
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
      )}
    </div>
  );
}
