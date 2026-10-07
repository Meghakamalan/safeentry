import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  email: "",
  password: "",
};


const Login = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      },
      {withCredentials: true}
    );

    // Save user details to localStorage for access across components
    localStorage.setItem("user", JSON.stringify(response.data.user));

    const role = response.data.user.role;
    
    if (role === "Resident") {
      navigate("/resident");
    } else if (role === "Admin") {
      navigate("/admin");
    } else if (role === "Guard") {
      navigate("/guard");
    }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div
        className="card shadow-sm border-0 w-100"
        style={{ maxWidth: 480 }}
      >
        <div className="card-body p-4">
          <h1 className="h3 fw-bold text-center">SafeEntry</h1>

          <p className="text-center text-secondary mb-4">
            Login to your resident account
          </p>

          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
