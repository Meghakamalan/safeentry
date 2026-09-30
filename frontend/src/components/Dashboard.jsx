// Dashboard is displayed after a successful login.
function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>SafeEntry</h1>

        {/* Clicking this button logs the user out. */}
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome, {user?.name}!</h2>

        <p>You have successfully logged in to SafeEntry.</p>

        <div className="dashboard-card">
          <h3>Your Account</h3>

          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>Role:</strong> {user?.role}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;