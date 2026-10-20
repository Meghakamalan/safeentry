import React from "react";
import { Link } from "react-router-dom";
import { getLoggedInUser } from "../Auth";

// Quick action cards. "roles" controls who sees each card.
const ACTIONS = [
  {
    icon: "👥",
    title: "Visitors",
    text: "View and manage visitor registrations.",
    to: "/visitors",
    button: "Manage Visitors",
    roles: ["resident", "guard", "admin"],
  },
  {
    icon: "📦",
    title: "Deliveries",
    text: "Record and view incoming deliveries.",
    to: "/deliveries",
    button: "View Deliveries",
    roles: ["resident", "guard"],
  },
  {
    icon: "🛠️",
    title: "Maintenance",
    text: "Submit or review building maintenance requests.",
    to: "/maintenance",
    button: "View Maintenance",
    roles: ["resident", "guard", "admin"],
  },
  {
    icon: "📢",
    title: "Announcements",
    text: "Read and manage community announcements.",
    to: "/announcements",
    button: "View Announcements",
    roles: ["resident", "guard", "admin"],
  },
  {
    icon: "🔑",
    title: "Users",
    text: "Manage resident, guard, and admin accounts.",
    to: "/users",
    button: "Manage Users",
    roles: ["admin"],
  },
  {
    icon: "👤",
    title: "My Profile",
    text: "View your account details and assigned unit.",
    to: "/profile",
    button: "View Profile",
    roles: ["resident", "guard", "admin"],
  },
];

export default function Home() {
  const user = getLoggedInUser();

  const userName = user?.first_name || user?.name || "User";
  const role = String(user?.role || "resident").toLowerCase();

  const visibleActions = ACTIONS.filter((action) =>
    action.roles.includes(role)
  );

  return (
    <div className="container-fluid py-4">
      {/* Welcome section */}
      <div className="bg-primary text-white rounded-4 p-4 p-md-5 mb-4">
        <h1 className="fw-bold">Welcome back, {userName}!</h1>

        <p className="mb-0">
          Welcome to SafeEntry. Manage visitors and keep track of your
          building's activities in one place.
        </p>

        <span className="badge bg-light text-primary mt-3 text-capitalize">
          {role}
        </span>
      </div>

      {/* Quick actions */}
      <h4 className="fw-bold mb-3">Quick Actions</h4>

      <div className="row g-4">
        {visibleActions.map((action, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={action.to}>
            <div className="card h-100 border-0 shadow-sm rounded-4">
              <div className="card-body p-4 d-flex flex-column">
                <div className="fs-1 mb-3">{action.icon}</div>

                <h5 className="card-title fw-bold">{action.title}</h5>

                <p className="text-muted">{action.text}</p>

                <Link
                  to={action.to}
                  className={`btn mt-auto align-self-start ${
                    index === 0 ? "btn-primary" : "btn-outline-primary"
                  }`}
                >
                  {action.button}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Information section */}
      <div className="card border-0 shadow-sm rounded-4 mt-4">
        <div className="card-body p-4">
          <h5 className="fw-bold">SafeEntry</h5>

          <p className="text-muted mb-0">
            Your building access and visitor management platform. Please
            ensure visitor information is accurate before submitting a
            registration.
          </p>
        </div>
      </div>
    </div>
  );
}