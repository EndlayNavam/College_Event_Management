import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function getHomeByRole(role) {
  if (role === "student") return "/student/events";
  if (role === "organizer") return "/organizer/create";
  return "/admin/pending";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendReady, setBackendReady] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkBackend() {
      try {
        await api.get("/health");
        if (active) setBackendReady(true);
      } catch (err) {
        if (active) {
          setBackendReady(false);
          setError(
            "Backend server is not reachable. Start the server and try again."
          );
        }
      }
    }

    checkBackend();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(getHomeByRole(user.role));
    } catch (err) {
      if (!err.response) {
        setBackendReady(false);
        setError(
          "Unable to reach backend. Ensure API server is running on http://localhost:5000."
        );
      } else {
        setError(err.response?.data?.message || "Unable to login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-noise" />
      <form className="auth-shell-card" onSubmit={handleSubmit}>
        <div className="auth-shell-core">
          <span className="eyebrow">Campus Event Matrix</span>
          <h1>Welcome Back</h1>
          <p>Access your premium student, organizer, or admin workspace.</p>

          {error ? <p className="form-error">{error}</p> : null}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!backendReady ? (
            <p className="helper-text">
              Backend health check failed. Start server with `npm run dev` in `server`.
            </p>
          ) : null}

          <button className="primary-action full" type="submit" disabled={loading}>
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>

          <p className="auth-note">
            New user? <Link to="/register">Create account</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
