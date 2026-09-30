import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Login component displays the login form.
function Login({ onLogin }) {
  // Store the email entered by the user.
  const [email, setEmail] = useState("");

  // Store the password entered by the user.
  const [password, setPassword] = useState("");

  // Store any error message returned by the backend.
  const [error, setError] = useState("");

  // Track whether the login request is in progress.
  const [loading, setLoading] = useState(false);

  // Allows us to navigate to another page after login.
  const navigate = useNavigate();

  // This function runs when the user submits the form.
  const handleSubmit = async (e) => {
    // Prevent the browser from reloading the page.
    e.preventDefault();

    // Clear any previous error message.
    setError("");

    // Show a loading state while contacting the backend.
    setLoading(true);

    try {
      // Send the login details to the Express backend.
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          // Tell the backend that we are sending JSON.
          headers: {
            "Content-Type": "application/json",
          },

          // Allow the browser to receive the HTTP-only cookie.
          credentials: "include",

          // Convert the JavaScript object into JSON.
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // Convert the backend response into a JavaScript object.
      const data = await response.json();

      // If the backend returns an error, display it.
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Send the logged-in user's information to App.jsx.
      onLogin(data.user);

      // Navigate to the dashboard after successful login.
      navigate("/dashboard");
    } catch (err) {
      // Display an error if login fails.
      setError(err.message);
    } finally {
      // Stop showing the loading state.
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>SafeEntry</h1>

        <p className="subtitle">
          Welcome back! Please log in to your account.
        </p>

        {/* Display an error message when login fails. */}
        {error && <p className="error-message">{error}</p>}

        {/* Submit the login details when the form is submitted. */}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;