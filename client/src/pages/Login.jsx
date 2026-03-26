import { useState } from "react";
import API from "../api";

export default function Login({ onSwitch, onAuth }) {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        name: res.data.name,
        email: res.data.email
      }));
      onAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "16px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px"
          }}>
            ✨
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: "0 0 6px" }}>
            Welcome back!
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
            Sign in to your TaskFlow account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", color: "#991b1b",
            borderRadius: "10px", padding: "10px 14px",
            fontSize: "13px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit}>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              fontSize: "13px", fontWeight: "500",
              color: "#374151", display: "block", marginBottom: "6px"
            }}>
              Email address
            </label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handle}
              required
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: "10px", border: "1.5px solid #e5e7eb",
                fontSize: "14px", outline: "none", color: "#1f2937",
                boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#667eea"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              fontSize: "13px", fontWeight: "500",
              color: "#374151", display: "block", marginBottom: "6px"
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handle}
              required
              style={{
                width: "100%", padding: "11px 14px",
                borderRadius: "10px", border: "1.5px solid #e5e7eb",
                fontSize: "14px", outline: "none", color: "#1f2937",
                boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#667eea"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? "#c4b5fd" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white", border: "none",
              borderRadius: "10px", fontSize: "15px",
              fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "opacity 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Switch to Register */}
        <p style={{
          textAlign: "center", fontSize: "14px",
          color: "#6b7280", marginTop: "24px", marginBottom: 0
        }}>
          Don't have an account?{" "}
          <span
            onClick={onSwitch}
            style={{ color: "#667eea", cursor: "pointer", fontWeight: "600" }}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
}