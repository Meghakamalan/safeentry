import React from "react";
import{NavLink, useNavigate} from 'react-router-dom';
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const Sidebar = () => {
    const navigate = useNavigate();
   const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`,
      {},
      {withCredentials: true}

    );
    //Redirect user to login page after logging out
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
        backgroundColor: "#dce7f0", // Light blue 
      }}
    >
      {/* Top Section: App Title & Navigation Links */}
      <div>
        {/* App Title */}
        <h2
          className="h4 fw-bold mb-4"
          style={{ fontFamily: "serif", color: "#1f3a52" }}
        >
          SafeEntry
        </h2>

        {/* Navigation List */}
        <ul className="nav nav-pills flex-column gap-2">
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
        </ul>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="pt-3 border-top">
        <button
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