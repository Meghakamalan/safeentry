import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ;
// || "http://127.0.0.1:5001";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  unit_number: "",
  password: "",
  role: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value }); //...formData=spread operator

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
      setMessage(
        response.data.message || "Account created. You can now sign in.",
      );
      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
      <div className="card shadow-sm border-0 w-100" style={{ maxWidth: 480 }}>
        <div className="card-body p-4">
          <h1 className="h3 fw-bold text-center">SafeEntry</h1>
          <p className="text-center text-secondary mb-4">
            Create your resident account
          </p>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-6">
                <label htmlFor="first_name" className="form-label">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  className="form-control"
                  value={formData.first_name}
                  onChange={onChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="col-6">
                <label htmlFor="last_name" className="form-label">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  className="form-control"
                  value={formData.last_name}
                  onChange={onChange}
                  autoComplete="family-name"
                  required
                />
              </div>
              <div className="col-12">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="col-7">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={onChange}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="col-5">
                <label htmlFor="unit_number" className="form-label">
                  Unit
                </label>
                <input
                  id="unit_number"
                  name="unit_number"
                  className="form-control"
                  value={formData.unit_number}
                  onChange={onChange}
                  required
                />
              </div>
              {/* dropdown  */}
              <div className="col-7">
                <label htmlFor="unit_number" className="form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={onChange}
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="Resident">Resident</option>
                  <option value="Guard">Guard</option>
                </select>
              </div>

              {/* <div className="col-5">
                <label htmlFor="unit_number" className="form-label">
                  Unit
                </label>
                <input
                  id="unit_number"
                  name="unit_number"
                  className="form-control"
                  value={formData.unit_number}
                  onChange={onChange}
                  required
                />
              </div> */}
              <div className="col-12">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={onChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <div className="form-text">At least 8 characters.</div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-4"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-secondary small mt-3 mb-0">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
