import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";
import "./Login.css";
import { loginUser, forgotPassword } from "../../services/authApi.js";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetData, setResetData] = useState({
    email: "",
    newPassword: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;

    setResetData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(formData);

      if (response.data?.success) {
        const user = response.data.user;
        const role = String(user?.role || "").trim().toLowerCase();
        const normalizedRole = ["uder", "user", "rider", "passenger"].includes(role)
          ? "user"
          : role;

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify({ ...user, role: normalizedRole }));

        if (normalizedRole === "admin") {
          navigate("/admin/dashboard");
        } else if (normalizedRole === "user") {
          navigate("/user/home");
        } else if (normalizedRole === "driver") {
          navigate("/driver/dashboard");
        } else {
          alert("Invalid role: " + role);
        }
      } else {
        alert(response.data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        alert(
          `Status: ${error.response.status}\n` +
            `Response: ${JSON.stringify(error.response.data)}`
        );
      } else {
        alert("Backend connection failed!");
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetData.email || !resetData.newPassword) {
      alert("Please enter your email and new password.");
      return;
    }

    try {
      const response = await forgotPassword(resetData);

      if (response.data?.success) {
        alert(response.data.message || "Password reset successful.");
        setShowResetPassword(false);
        setResetData({ email: "", newPassword: "" });
      } else {
        alert(response.data?.message || "Password reset failed.");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);

      if (error.response) {
        alert(
          `Status: ${error.response.status}\n` +
            `Response: ${JSON.stringify(error.response.data)}`
        );
      } else {
        alert("Backend connection failed!");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={23} fill="currentColor" />
          </div>
          <h1>VoltRide</h1>
        </div>

        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Login to your VoltRide account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-button-row">
            <button
              type="button"
              className="auth-link-button"
              onClick={() => setShowResetPassword((prev) => !prev)}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit-button">
            Login
          </button>
        </form>

        {showResetPassword && (
          <form className="reset-password-box" onSubmit={handleForgotPassword}>
            <h3>Reset Password</h3>

            <div className="auth-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={resetData.email}
                onChange={handleResetChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reset-password">New Password</label>
              <input
                id="reset-password"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={resetData.newPassword}
                onChange={handleResetChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button reset-submit-button"
            >
              Update Password
            </button>
          </form>
        )}

        <div className="auth-bottom-text">
          <span>Don't have an account?</span>
          <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;