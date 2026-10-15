
import React from "react";
import { Link } from "react-router-dom";
import { getLoggedInUser } from "../Auth";

export default function Home() {
  const user = getLoggedInUser();

  const userName =
    user?.first_name ||
    user?.name ||
    "User";

  const role = user?.role || "Resident";

  return (
    <div className="container-fluid py-4">
      {/* Welcome section */}
      <div className="bg-primary text-white rounded-4 p-4 p-md-5 mb-4">
        <h1 className="fw-bold">
          Welcome back, {userName}!
        </h1>

        <p className="mb-0">
          Welcome to SafeEntry. Manage visitors and keep track
          of your building's activities in one place.
        </p>

        <span className="badge bg-light text-primary mt-3">
          {role}
        </span>
      </div>

      {/* Quick actions */}
      <h4 className="fw-bold mb-3">Quick Actions</h4>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="fs-1 mb-3">👥</div>

              <h5 className="card-title fw-bold">
                Visitors
              </h5>

              <p className="text-muted">
                View and manage visitor registrations.
              </p>

              <Link
                to="/visitors"
                className="btn btn-primary"
              >
                Manage Visitors
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="fs-1 mb-3">🛠️</div>

              <h5 className="card-title fw-bold">
                Maintenance
              </h5>

              <p className="text-muted">
                Submit or review building maintenance requests.
              </p>

              <Link
                to="/maintenance"
                className="btn btn-outline-primary"
              >
                View Maintenance
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="fs-1 mb-3">👤</div>

              <h5 className="card-title fw-bold">
                My Profile
              </h5>

              <p className="text-muted">
                View your account details and assigned unit.
              </p>

              <Link
                to="/profile"
                className="btn btn-outline-primary"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Information section */}
      <div className="card border-0 shadow-sm rounded-4 mt-4">
        <div className="card-body p-4">
          <h5 className="fw-bold">SafeEntry</h5>

          <p className="text-muted mb-0">
            Your building access and visitor management
            platform. Please ensure visitor information is
            accurate before submitting a registration.
          </p>
        </div>
      </div>
    </div>
  );
}
