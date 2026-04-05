import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getHomeByRole(role) {
  if (role === "student") return "/student/events";
  if (role === "organizer") return "/organizer/create";
  return "/admin/pending";
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(getHomeByRole(user.role));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-noise" />
      <form className="auth-shell-card" onSubmit={handleSubmit}>
        <div className="auth-shell-core">
          <span className="eyebrow">Create Access</span>
          <h1>Join The Workspace</h1>
          <p>Choose your role and enter the event management experience.</p>

          {error ? <p className="form-error">{error}</p> : null}

          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            minLength={6}
          />

          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
          >
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Administration</option>
          </select>

          <button className="primary-action full" type="submit" disabled={loading}>
            <span>{loading ? "Creating..." : "Create Account"}</span>
          </button>

          <p className="auth-note">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
