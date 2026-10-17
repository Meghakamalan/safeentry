
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole, getLoggedInUser } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    first_name: "",
    last_name: "",
    unit_number: "",
    resident_id: "",
    expected_date: new Date().toISOString().split("T")[0],
    expected_time: "10:00",
    vehicle_info: "",
};

const Visitors = () => {
    const [visitors, setVisitors] = useState([]);
    const [allVisitors, setAllVisitors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Read the logged-in user from Auth.jsx and localStorage.
    const loggedInUser = getLoggedInUser();

    const savedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    })();

    const currentUser = loggedInUser || savedUser;

    const userRole = String(
        currentUser?.role || getUserRole() || ""
    ).toLowerCase();

    // Support both unit and unit_number.
    const residentUnitNumber = String(
        currentUser?.unit ??
        currentUser?.unit_number ??
        ""
    ).trim();

    const isAdmin = userRole === "admin";
    const isResident = userRole === "resident";
    const isGuard = userRole === "guard";

    const canAddVisitor = isResident || isGuard;
    const canEditVisitor = isResident;
    const canDeleteVisitor = isResident || isAdmin;
    const isReadOnly = isAdmin;

    // Keep the resident's assigned unit in the form.
    useEffect(() => {
        if (isResident && residentUnitNumber) {
            setFormData((previous) => ({
                ...previous,
                unit_number: residentUnitNumber,
            }));
        }
    }, [isResident, residentUnitNumber]);

    // Fetch visitors for Residents and Guards.
    const fetchVisitors = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/visitors`,
                { withCredentials: true }
            );

            const data = response.data;

            setVisitors(
                Array.isArray(data)
                    ? data
                    : data?.visitors || []
            );

            setError(null);
        } catch (error) {
            console.error("Error fetching visitors:", error);

            setError(
                error.response?.data?.message ||
                "Failed to fetch visitors. Please try again."
            );
        }
    }, []);

    // Fetch all visitors for Admin.
    const fetchAllVisitors = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/visitors/AllVisitors`,
                { withCredentials: true }
            );

            const data = response.data;

            setAllVisitors(
                Array.isArray(data)
                    ? data
                    : data?.visitors || []
            );

            setError(null);
        } catch (error) {
            console.error("Error fetching all visitors:", error);

            setError(
                error.response?.data?.message ||
                "Failed to fetch all visitors. Please try again."
            );
        }
    }, []);

    // Refresh the list according to the user's role.
    const refreshVisitors = useCallback(async () => {
        if (isAdmin) {
            await fetchAllVisitors();
        } else {
            await fetchVisitors();
        }
    }, [isAdmin, fetchAllVisitors, fetchVisitors]);

    useEffect(() => {
        refreshVisitors();
    }, [refreshVisitors]);

    const displayedVisitors = isAdmin ? allVisitors : visitors;

    // Handle form input changes.
    const onChange = (e) => {
        if (isReadOnly) return;

        const { name, value } = e.target;

        // Residents cannot change their assigned unit.
        if (isResident && name === "unit_number") return;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Open the new visitor form.
    const handleAddNew = () => {
        if (!canAddVisitor) return;

        if (isResident && !residentUnitNumber) {
            setError(
                "Your unit number could not be loaded. Please log in again. If the problem continues, check Auth.jsx."
            );
            return;
        }

        setFormData({
            ...initialForm,
            unit_number: isResident ? residentUnitNumber : "",
            expected_date: new Date().toISOString().split("T")[0],
        });

        setEditingId(null);
        setError(null);
        setShowForm(true);
    };

    // Admin can view a visitor's details.
    const handleView = (visitor) => {
        if (!isAdmin) return;

        setFormData({
            ...initialForm,
            first_name: visitor.first_name || "",
            last_name: visitor.last_name || "",
            unit_number:
                visitor.unit_number ||
                visitor.resident_id?.unit ||
                "",
            resident_id:
                visitor.resident_id?._id ||
                visitor.resident_id ||
                "",
            expected_date: visitor.expected_date
                ? String(visitor.expected_date).split("T")[0]
                : "",
            expected_time: visitor.expected_time || "10:00",
            vehicle_info: visitor.vehicle_info || "",
        });

        setEditingId(null);
        setError(null);
        setShowForm(true);
    };

    // Resident can edit their own visitor.
    const handleEdit = (visitor) => {
        if (!canEditVisitor) return;

        if (!residentUnitNumber) {
            setError(
                "Your account does not have a unit number assigned. Please contact your administrator."
            );
            return;
        }

        setFormData({
            ...initialForm,
            first_name: visitor.first_name || "",
            last_name: visitor.last_name || "",
            unit_number: residentUnitNumber,
            expected_date: visitor.expected_date
                ? String(visitor.expected_date).split("T")[0]
                : new Date().toISOString().split("T")[0],
            expected_time: visitor.expected_time || "10:00",
            vehicle_info: visitor.vehicle_info || "",
        });

        setEditingId(visitor._id || visitor.id);
        setError(null);
        setShowForm(true);
    };

    // Resident/Admin can delete visitors, subject to backend permissions.
    const handleDelete = async (id) => {
        if (!canDeleteVisitor) return;

        if (!window.confirm("Are you sure you want to delete this visitor?")) {
            return;
        }

        try {
            setError(null);

            await axios.delete(
                `${API_URL}/api/visitors/${id}`,
                { withCredentials: true }
            );

            await refreshVisitors();
        } catch (error) {
            console.error("Failed to delete visitor:", error);

            setError(
                error.response?.data?.message ||
                "Failed to delete visitor. Please try again."
            );
        }
    };

    // Guard can update a visitor's status.
    const handleStatusChange = async (visitorId, newStatus) => {
        if (!isGuard) return;

        const allowedStatuses = [
            "Pending",
            "Checked-In",
            "Checked-Out",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(newStatus)) {
            setError("Invalid visitor status.");
            return;
        }

        try {
            setError(null);

            await axios.patch(
                `${API_URL}/api/visitors/${visitorId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );

            await refreshVisitors();
        } catch (error) {
            console.error("Failed to update visitor status:", error);

            setError(
                error.response?.data?.message ||
                "Failed to update visitor status. Please try again."
            );
        }
    };

    // Create or update a visitor.
    const onSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;
  if (editingId && !canEditVisitor) return;
  if (!editingId && !canAddVisitor) return;

  const unitNumber = isResident
    ? getResidentUnit()
    : String(formData.unit_number || "").trim();

  if (isResident && !unitNumber) {
    setError("Your account does not have a unit number assigned.");
    return;
  }

  // Check unit number for Guards (without requiring resident_id)
  if (isGuard && !unitNumber) {
    setError("Please enter the resident's unit number.");
    return;
  }

  if (!formData.first_name.trim() || !formData.last_name.trim()) {
    setError("Please enter the visitor's first and last name.");
    return;
  }

  if (!formData.expected_date || !formData.expected_time) {
    setError("Please select the expected date and time.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const submissionData = {
      ...formData,
      unit_number: unitNumber,
    };

    if (editingId) {
      await axios.put(
        `${API_URL}/api/visitors/${editingId}`,
        submissionData,
        { withCredentials: true }
      );
    } else {
      await axios.post(
        `${API_URL}/api/visitors`,
        submissionData,
        { withCredentials: true }
      );
    }

    await refreshVisitors();
    setShowForm(false);
    setFormData(initialForm);
    setEditingId(null);
  } catch (error) {
    console.error("Error saving visitor:", error);
    setError(
      error.response?.data?.message ||
      "Failed to save visitor. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "—";

        const dateObj = new Date(dateString);

        if (Number.isNaN(dateObj.getTime())) return "—";

        return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Checked-In":
                return "bg-success text-white";
            case "Checked-Out":
                return "bg-secondary text-white";
            case "Cancelled":
                return "bg-danger text-white";
            case "Pending":
            default:
                return "bg-warning text-dark";
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            ...initialForm,
            unit_number: isResident ? residentUnitNumber : "",
        });
        setError(null);
    };

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold"
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? isAdmin
                            ? "View Visitor"
                            : editingId
                                ? "Edit Visitor"
                                : "Register New Visitor"
                        : "Visitors"}
                </h1>

                {!showForm && canAddVisitor && (
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="btn text-white px-4 py-2"
                        style={{
                            backgroundColor: "#4155c7",
                            borderRadius: "4px",
                        }}
                    >
                        + Add a visitor
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={onSubmit}>
                            <div className="row g-3">
                                <div className="col-6">
                                    <label htmlFor="first_name" className="form-label fw-semibold">
                                        First Name
                                    </label>
                                    <input
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        className="form-control"
                                        value={formData.first_name}
                                        onChange={onChange}
                                        readOnly={isReadOnly}
                                        required
                                    />
                                </div>

                                <div className="col-6">
                                    <label htmlFor="last_name" className="form-label fw-semibold">
                                        Last Name
                                    </label>
                                    <input
                                        id="last_name"
                                        type="text"
                                        name="last_name"
                                        className="form-control"
                                        value={formData.last_name}
                                        onChange={onChange}
                                        readOnly={isReadOnly}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="unit_number" className="form-label fw-semibold">
                                        Unit Number
                                    </label>
                                    <input
                                        id="unit_number"
                                        type="text"
                                        name="unit_number"
                                        className="form-control"
                                        placeholder={
                                            isResident
                                                ? "Your registered unit"
                                                : "e.g. 1205"
                                        }
                                        value={formData.unit_number}
                                        onChange={onChange}
                                        readOnly={isReadOnly || isResident}
                                        required
                                    />

                                    {isResident && (
                                        <small className="text-muted">
                                            Your registered unit is filled in automatically.
                                        </small>
                                    )}
                                </div>

                                {/* {isGuard && (
                                    <div className="col-12">
                                        <label htmlFor="resident_id" className="form-label fw-semibold">
                                            Resident Account ID
                                        </label>
                                        <input
                                            id="resident_id"
                                            type="text"
                                            name="resident_id"
                                            className="form-control"
                                            value={formData.resident_id}
                                            onChange={onChange}
                                            placeholder="Enter the resident's MongoDB user ID"
                                            required
                                        />
                                    </div>
                                )} */}

                                <div className="col-12">
                                    <label htmlFor="expected_date" className="form-label fw-semibold">
                                        Expected Date
                                    </label>
                                    <input
                                        id="expected_date"
                                        type="date"
                                        name="expected_date"
                                        className="form-control"
                                        value={formData.expected_date}
                                        onChange={onChange}
                                        readOnly={isReadOnly}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="expected_time" className="form-label fw-semibold">
                                        Expected Time
                                    </label>
                                    <input
                                        id="expected_time"
                                        type="time"
                                        name="expected_time"
                                        className="form-control"
                                        value={formData.expected_time}
                                        onChange={onChange}
                                        readOnly={isReadOnly}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="vehicle_info" className="form-label fw-semibold">
                                        Vehicle Info
                                    </label>
                                    <textarea
                                        id="vehicle_info"
                                        name="vehicle_info"
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g. CJCX 389 Ford F-Series truck"
                                        value={formData.vehicle_info}
                                        onChange={onChange}
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-3 mt-4">
                                {!isReadOnly && (
                                    <button
                                        type="submit"
                                        className="btn text-white flex-grow-1"
                                        style={{ backgroundColor: "#695e59" }}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Submitting..."
                                            : editingId
                                                ? "Save Changes"
                                                : "Submit"}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn text-white flex-grow-1"
                                    style={{ backgroundColor: "#ca5c5c" }}
                                    onClick={closeForm}
                                    disabled={loading}
                                >
                                    {isReadOnly ? "Close" : "Cancel"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle text-center">
                        <thead style={{ backgroundColor: "#ede6e2" }}>
                            <tr>
                                <th className="py-3">Visitor Name</th>
                                <th className="py-3">Unit Number</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Time</th>
                                <th className="py-3">Vehicle Info</th>
                                <th className="py-3">Status</th>

                                {(canEditVisitor || canDeleteVisitor || isAdmin) && (
                                    <th className="py-3">Action</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {displayedVisitors.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            6 +
                                            (canEditVisitor || canDeleteVisitor || isAdmin ? 1 : 0)
                                        }
                                        className="py-4 text-muted"
                                    >
                                        No visitors registered yet.
                                    </td>
                                </tr>
                            ) : (
                                displayedVisitors.map((visitor) => (
                                    <tr key={visitor._id || visitor.id}>
                                        <td>
                                            {visitor.first_name} {visitor.last_name}
                                        </td>

                                        <td>
                                            {visitor.unit_number ||
                                                (isResident ? residentUnitNumber : "") ||
                                                visitor.resident_id?.unit ||
                                                "—"}
                                        </td>

                                        <td>
                                            {formatDateDisplay(visitor.expected_date)}
                                        </td>

                                        <td>{visitor.expected_time || "—"}</td>

                                        <td style={{ whiteSpace: "pre-line" }}>
                                            {visitor.vehicle_info || "—"}
                                        </td>

                                        <td>
                                            {isGuard ? (
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={visitor.status || "Pending"}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            visitor._id || visitor.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-label={`Update status for ${visitor.first_name} ${visitor.last_name}`}
                                                    style={{ minWidth: "140px" }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Checked-In">Checked-In</option>
                                                    <option value="Checked-Out">Checked-Out</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`badge px-3 py-2 rounded-pill ${getStatusBadge(visitor.status)}`}
                                                >
                                                    {visitor.status || "Pending"}
                                                </span>
                                            )}
                                        </td>

                                        {(canEditVisitor || canDeleteVisitor || isAdmin) && (
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#4155c7" }}
                                                            onClick={() => handleView(visitor)}
                                                        >
                                                            View
                                                        </button>
                                                    )}

                                                    {canEditVisitor && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#5f6368" }}
                                                            onClick={() => handleEdit(visitor)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {canDeleteVisitor && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#ca5c5c" }}
                                                            onClick={() =>
                                                                handleDelete(visitor._id || visitor.id)
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Visitors;
