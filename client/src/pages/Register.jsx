import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SnakeOverlay from "../components/SnakeOverlay";
import Mascot from "../components/Mascot";

export default function Register() {
  const { register } = useAuth();         // front-end only register (localStorage)
  const navigate = useNavigate();

  // for mascot behavior
  const [mood, setMood] = useState("idle");
  const [showPw, setShowPw] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register(name, email, password); // always succeeds (no backend)
      navigate("/");
    } catch (e) {
      setErr("Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* full-page ambient snake, behind everything */}
      <SnakeOverlay />

      <div className="auth-page">
        <div
          className="auth-left"
          onMouseEnter={() => setMood("dance")}
          onMouseLeave={() => setMood("idle")}
        >
          <Mascot lookAway={pwFocused && !showPw} mood={mood} />
        </div>

        <div className="auth-right">
          <div className="auth-card-nice">
            <div className="h4 mb-1">ResQHub</div>
            <div className="text-muted small mb-3">See. Assign. Resolve.</div>

            <h5 className="mb-2">Create account</h5>
            {err && <div className="alert alert-danger py-2">{err}</div>}

            <form onSubmit={onSubmit} className="vstack gap-3">
              <div>
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-control"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocused(true)}
                    onBlur={() => setPwFocused(false)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    style={{ position: "absolute", right: 10, top: 8 }}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    title={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </button>
            </form>

            <div className="mt-3">
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
