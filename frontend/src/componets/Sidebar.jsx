import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

const Sidebar = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className="d-flex flex-column justify-content-between p-3 border-end"
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#dce7f0",
      }}
    >
      {/* Top Section: App Title and Navigation Links */}
      <div>
        <h2
          className="h4 fw-bold mb-4"
          style={{
            fontFamily: "serif",
            color: "#1f3a52",
          }}
        >
          SafeEntry
        </h2>

        {/* Navigation List */}
        <ul className="nav nav-pills flex-column gap-2">
          {/* Resident Menu */}
          {userRole === "Resident" || userRole === "Guard" && (
            <>
              <li className="nav-item">
                <NavLink
                  to="/resident"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Homes
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/visitors"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Visitors
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/announcements"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Announcements
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/deliveries"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Deliveries
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/maintenance"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Maintenance
                </NavLink>
              </li>
            </>
          )}

          {/* Admin Menu */}
          {userRole === "Admin" && (
            <>
              <li className="nav-item">
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Users
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/visitors"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Visitors
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/announcements"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Announcements
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/maintenance"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active fw-bold" : "text-dark"}`
                  }
                >
                  Maintenance
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="pt-3 border-top">
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-link text-dark text-decoration-none p-0 fw-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
