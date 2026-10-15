
import React, { useEffect, useState } from "react";
import { getLoggedInUser } from "../Auth";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    setUser(loggedInUser || null);
  }, []);

  if (!user) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">
          Unable to load your profile. Please log in again.
        </div>
      </div>
    );
  }

  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName =
    user.name || `${firstName} ${lastName}`.trim() || "User";

  const role = user.role || "User";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="container py-4">
      {/* Page Heading */}
      <div className="mb-4">
        <h2 className="fw-bold">My Profile</h2>
        <p className="text-muted">
          View your SafeEntry account information.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            {/* Profile Header */}
            <div className="card-body text-center p-4">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                {initials || fullName.charAt(0).toUpperCase()}
              </div>

              <h3 className="fw-bold mb-1">{fullName}</h3>

              <p className="text-muted mb-3">{user.email}</p>

              <span className="badge bg-primary px-3 py-2">
                {role}
              </span>
            </div>

            <hr className="my-0" />

            {/* Account Information */}
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Account Information</h5>

              <div className="row mb-3">
                <div className="col-sm-4 text-muted">
                  First Name
                </div>
                <div className="col-sm-8 fw-semibold">
                  {firstName || "Not provided"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 text-muted">
                  Last Name
                </div>
                <div className="col-sm-8 fw-semibold">
                  {lastName || "Not provided"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 text-muted">
                  Email Address
                </div>
                <div className="col-sm-8 fw-semibold text-break">
                  {user.email || "Not provided"}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4 text-muted">
                  Account Role
                </div>
                <div className="col-sm-8 fw-semibold">
                  {role}
                </div>
              </div>

              {String(role).toLowerCase() === "resident" && (
                <div className="row mb-3">
                  <div className="col-sm-4 text-muted">
                    Unit Number
                  </div>
                  <div className="col-sm-8 fw-semibold">
                    {user.unit || user.unit_number || "Not assigned"}
                  </div>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-sm-4 text-muted">
                  Account ID
                </div>
                <div className="col-sm-8 fw-semibold text-break">
                  {user.id || user._id || "Not available"}
                </div>
              </div>
            </div>

            <div className="card-footer bg-light border-0 p-3">
              <small className="text-muted">
                For changes to your account information, please contact
                your property administrator.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
