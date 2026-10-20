import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

const Sidebar = () => {
    const navigate = useNavigate();
    const userRole = String(getUserRole() || "").toLowerCase();

    const isResident = userRole === "resident";
    const isGuard = userRole === "guard";
    const isAdmin = userRole === "admin";

    const handleLogout = async () => {
        try {
            await axios.post(
                `${API_URL}/api/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Clear local user data even if the request fails
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    };

    const linkClass = ({ isActive }) =>
        `nav-link ${isActive ? "active fw-bold" : "text-dark"}`;

    return (
        <aside
            className="d-flex flex-column justify-content-between p-3 border-end"
            style={{
                width: "240px",
                minHeight: "100vh",
                backgroundColor: "#dce7f0",
            }}
        >
            <div>
                <h2
                    className="h4 fw-bold mb-4"
                    style={{
                        fontFamily: "serif",
                        color: "#1f3a52",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/home")}
                >
                    SafeEntry
                </h2>

                <ul className="nav nav-pills flex-column gap-2">
                    {/* Resident navigation */}
                    {isResident && (
                        <>
                            <li className="nav-item">
                                <NavLink to="/home" className={linkClass}>
                                    Homes
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/visitors" className={linkClass}>
                                    Visitors
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/announcements"
                                    className={linkClass}
                                >
                                    Announcements
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/deliveries"
                                    className={linkClass}
                                >
                                    My Deliveries
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/maintenance"
                                    className={linkClass}
                                >
                                    Maintenance
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Guard navigation */}
                    {isGuard && (
                        <>
                            <li className="nav-item">
                                <NavLink to="/home" className={linkClass}>
                                    Homes
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/visitors" className={linkClass}>
                                    Visitors
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/announcements"
                                    className={linkClass}
                                >
                                    Announcements
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/deliveries"
                                    className={linkClass}
                                >
                                    Delivery Management
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/maintenance"
                                    className={linkClass}
                                >
                                    Maintenance
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Admin navigation */}
                    {isAdmin && (
                        <>
                            <li className="nav-item">
                                <NavLink to="/home" className={linkClass}>
                                    Homes
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/users" className={linkClass}>
                                    Users
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink to="/visitors" className={linkClass}>
                                    Visitors
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/announcements"
                                    className={linkClass}
                                >
                                    Announcements
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    to="/maintenance"
                                    className={linkClass}
                                >
                                    Maintenance
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* Logout */}
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
