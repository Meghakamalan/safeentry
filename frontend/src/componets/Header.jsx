
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ user }) => {
    const navigate = useNavigate();

    // Get the user's initials
    const getInitials = (user) => {
        if (!user) return "?";

        const firstName = user.first_name || "";
        const lastName = user.last_name || "";

        if (firstName && lastName) {
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        }

        if (user.name) {
            return user.name
                .split(" ")
                .filter(Boolean)
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase();
        }

        return firstName.charAt(0).toUpperCase() || "?";
    };

    const initials = getInitials(user);
    const fullName =
        user?.name ||
        `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
        "Logged In User";

    return (
        <header className="d-flex justify-content-end align-items-center p-3 border-bottom bg-white">
            <button
                type="button"
                onClick={() => navigate("/profile")}
                className="btn btn-light d-flex align-items-center gap-3 border-0"
                aria-label="Open profile"
                title="View profile"
            >
                {/* User Information */}
                <div className="text-end d-none d-sm-block">
                    <div className="fw-semibold text-dark">
                        {fullName}
                    </div>
                    <small className="text-muted">
                        {user?.role || "User"}
                    </small>
                </div>

                {/* User Initials Avatar */}
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: "38px",
                        height: "38px",
                        minWidth: "38px",
                        backgroundColor: "#42566d",
                        fontSize: "0.9rem",
                    }}
                >
                    {initials}
                </div>
            </button>
        </header>
    );
};

export default Header;
