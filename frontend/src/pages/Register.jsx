import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Sign up and get ₹500 in your Ucab wallet to start riding.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={update("name")} placeholder="Sarah Khan" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="switch-auth">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
