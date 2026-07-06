import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">U</span>
        Ucab
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">Book a ride</Link>
            <Link to="/history">History</Link>
            {user.isAdmin && <Link to="/admin">Admin</Link>}
            <span className="wallet-pill">₹{user.walletBalance?.toFixed(0)}</span>
            <button className="link-btn" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-cta">
            Log in
          </Link>
        )}
      </div>
    </div>
  );
}
