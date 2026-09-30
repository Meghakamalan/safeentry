import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  // user's name
  const [name, setName] = useState("");
  // user's email
  const [email, setEmail] = useState("");
  //user's password
  const [password, setPassword] = useState("");
  // success or error messages.
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Track whether registration is in progress.
  const [loading, setLoading] = useState(false);
  // Navigate to the login page after registration.
  const navigate = useNavigate();

  // after the user submits the form, this function runs
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      // Send the registration information to the backend
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
          },
          // Send the form data as JSON
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );
      // Read the backend response
      const data = await response.json();

      // Display an error if registration fails
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Display a success message
      setMessage("Registration successful! Please log in.");

      // Navigate to the login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>SafeEntry</h1>

        <p className="subtitle">
          Create your resident account.
        </p>

        {/* Show success and error messages. */}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="register-email">Email Address</label>

          <input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;