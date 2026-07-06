import { useState } from "react";
import api from "../api";
import CabCard from "../components/CabCard";
import { useAuth } from "../context/AuthContext";

const REFRESHMENT_MENU = [
  { item: "Bottled water", price: 15 },
  { item: "Chips", price: 25 },
  { item: "Coffee", price: 40 },
];

const STATUS_STEPS = ["DriverAssigned", "OnTheWay", "Completed"];

export default function Home() {
  const { updateWallet } = useAuth();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [donate, setDonate] = useState(false);
  const [refreshmentKeys, setRefreshmentKeys] = useState([]);
  const [discountCode, setDiscountCode] = useState("");

  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const donationAmount = donate ? 10 : 0;
  const refreshmentsTotal = REFRESHMENT_MENU.filter((r) => refreshmentKeys.includes(r.item)).reduce(
    (sum, r) => sum + r.price,
    0
  );
  const discountPreview =
    selected && discountCode.trim().toUpperCase() === "UCAB10" ? Math.round(selected.fare * 0.1) : 0;
  const estimatedTotal = selected ? selected.fare + donationAmount + refreshmentsTotal - discountPreview : 0;

  const handleEstimate = async (e) => {
    e.preventDefault();
    setEstimateError("");
    setSelected(null);
    setBooking(null);
    setBookingError("");
    if (!pickup.trim() || !drop.trim()) return;

    setLoadingEstimate(true);
    try {
      const res = await api.post("/bookings/estimate", { pickup, drop });
      setDistanceKm(res.data.distanceKm);
      setOptions(res.data.options);
    } catch (err) {
      setEstimateError(err.response?.data?.message || "Could not fetch nearby cabs. Please try again.");
    } finally {
      setLoadingEstimate(false);
    }
  };

  const toggleRefreshment = (item) => {
    setRefreshmentKeys((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleBook = async () => {
    if (!selected) return;
    setPlacingOrder(true);
    setBookingError("");
    try {
      const refreshments = REFRESHMENT_MENU.filter((r) => refreshmentKeys.includes(r.item));
      const res = await api.post("/bookings", {
        pickup,
        drop,
        cabType: selected.cabType,
        donation: donationAmount,
        refreshments,
        discountCode,
      });
      setBooking(res.data.booking);
      updateWallet(res.data.walletBalance);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Could not place booking. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const advanceStatus = async () => {
    if (!booking) return;
    const currentIndex = STATUS_STEPS.indexOf(booking.status);
    const next = STATUS_STEPS[currentIndex + 1];
    if (!next) return;
    const res = await api.patch(`/bookings/${booking._id}/status`, { status: next });
    setBooking(res.data);
  };

  const resetFlow = () => {
    setPickup("");
    setDrop("");
    setOptions([]);
    setSelected(null);
    setBooking(null);
    setDistanceKm(null);
    setDonate(false);
    setRefreshmentKeys([]);
    setDiscountCode("");
  };

  const statusIndex = booking ? STATUS_STEPS.indexOf(booking.status) : -1;
  const progressPercent = booking
    ? booking.status === "Cancelled"
      ? 0
      : ((statusIndex + 1) / STATUS_STEPS.length) * 100
    : 0;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-copy">
          <h1>
            Go anywhere, <span className="accent-word">arrive on time.</span>
          </h1>
          <p>
            Enter your pickup and drop-off to see nearby cabs, live fares, and arrival times in seconds — then
            book, track, and pay, all from one screen.
          </p>
        </div>

        <form className="route-card" onSubmit={handleEstimate}>
          <div className="route-line">
            <span className="dot pickup" />
            <input
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
          </div>
          <div className="route-line">
            <span className="dot drop" />
            <input placeholder="Drop-off location" value={drop} onChange={(e) => setDrop(e.target.value)} required />
          </div>

          {estimateError && <div className="error-banner">{estimateError}</div>}

          <button className="btn-primary" type="submit" disabled={loadingEstimate}>
            {loadingEstimate ? "Finding cabs..." : "Find nearby cabs"}
          </button>
        </form>
      </div>

      {booking && (
        <div className="status-banner">
          <div className="status-row">
            <div>
              <div className="history-route">
                {booking.pickup} → {booking.drop}
              </div>
              <div className="history-meta">
                {booking.driverName} · {booking.vehicleNumber} · {booking.cabType}
              </div>
            </div>
            <span className={`status-badge ${booking.status}`}>{booking.status.replace(/([A-Z])/g, " $1").trim()}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, alignItems: "center" }}>
            <span className="history-meta">Fare paid: ₹{booking.fare}</span>
            {booking.status !== "Completed" && booking.status !== "Cancelled" ? (
              <button className="small-btn" onClick={advanceStatus}>
                Simulate next update
              </button>
            ) : (
              <button className="small-btn" onClick={resetFlow}>
                Book another ride
              </button>
            )}
          </div>
        </div>
      )}

      {!booking && options.length > 0 && (
        <>
          <h2 className="section-title">
            Nearby cabs {distanceKm ? `· ${distanceKm} km trip` : ""}
          </h2>
          <div className="cab-grid">
            {options.map((opt) => (
              <CabCard
                key={opt.cabType}
                option={opt}
                selected={selected?.cabType === opt.cabType}
                onSelect={setSelected}
              />
            ))}
          </div>

          {selected && (
            <>
              <div className="extras">
                <div>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={donate} onChange={(e) => setDonate(e.target.checked)} />
                    Round up ₹10 to donate to road safety programs
                  </label>
                  {REFRESHMENT_MENU.map((r) => (
                    <label className="checkbox-row" key={r.item}>
                      <input
                        type="checkbox"
                        checked={refreshmentKeys.includes(r.item)}
                        onChange={() => toggleRefreshment(r.item)}
                      />
                      Add {r.item} (+₹{r.price})
                    </label>
                  ))}
                </div>
                <div className="field">
                  <label htmlFor="discount">Discount code</label>
                  <input
                    id="discount"
                    placeholder="Try UCAB10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  {discountPreview > 0 && <div className="badge-discount">-₹{discountPreview} applied</div>}
                </div>
              </div>

              {bookingError && <div className="error-banner">{bookingError}</div>}

              <div className="book-bar">
                <div>
                  <div className="history-meta">Total fare for {selected.cabType}</div>
                  <div className="total">₹{estimatedTotal}</div>
                </div>
                <button onClick={handleBook} disabled={placingOrder}>
                  {placingOrder ? "Booking..." : "Book this ride"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
