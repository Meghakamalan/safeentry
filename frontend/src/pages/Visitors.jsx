
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    first_name: "",
    last_name: "",
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

    const userRole = String(getUserRole() || "").toLowerCase();

    const isAdmin = userRole === "admin";
    const isResident = userRole === "resident";
    const isGuard = userRole === "guard";

    const canAddVisitor = isResident || isGuard;
    const canEditVisitor = isResident;
    const canDeleteVisitor = isResident || isAdmin;
    const isReadOnly = isAdmin;

    // Fetch visitors for Residents and Guards.
    const fetchVisitors = useCallback(async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/visitors`,
                { withCredentials: true }
            );

            setVisitors(
                Array.isArray(response.data) ? response.data : []
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

            setAllVisitors(
                Array.isArray(response.data) ? response.data : []
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

    // Fetch the appropriate list based on role.
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

        setFormData((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    // Open form for creating a visitor.
    const handleAddNew = () => {
        if (!canAddVisitor) return;

        setFormData({
            ...initialForm,
            expected_date: new Date().toISOString().split("T")[0],
        });

        setEditingId(null);
        setError(null);
        setShowForm(true);
    };

    // Open a visitor in read-only mode for Admin.
    const handleView = (visitor) => {
        if (!isAdmin) return;

        const formattedDate = visitor.expected_date
            ? new Date(visitor.expected_date).toISOString().split("T")[0]
            : "";

        setFormData({
            first_name: visitor.first_name || "",
            last_name: visitor.last_name || "",
            expected_date: formattedDate,
            expected_time: visitor.expected_time || "10:00",
            vehicle_info: visitor.vehicle_info || "",
        });

        setEditingId(null);
        setError(null);
        setShowForm(true);
    };

    // Open form for editing a visitor. Residents only.
    const handleEdit = (visitor) => {
        if (!canEditVisitor) return;

        const formattedDate = visitor.expected_date
            ? new Date(visitor.expected_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        setFormData({
            first_name: visitor.first_name || "",
            last_name: visitor.last_name || "",
            expected_date: formattedDate,
            expected_time: visitor.expected_time || "10:00",
            vehicle_info: visitor.vehicle_info || "",
        });

        setEditingId(visitor._id);
        setError(null);
        setShowForm(true);
    };

    // Delete a visitor. Residents and Admins only.
    const handleDelete = async (id) => {
        if (!canDeleteVisitor) return;

        if (!window.confirm("Are you sure you want to delete this visitor?")) {
            return;
        }

        try {
            setError(null);

            await axios.delete(`${API_URL}/api/visitors/${id}`, {
                withCredentials: true,
            });

            await refreshVisitors();
        } catch (error) {
            console.error("Failed to delete visitor:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to delete visitor. Please try again."
            );
        }
    };

    // Submit form to create or update a visitor.
    const onSubmit = async (e) => {
        e.preventDefault();

        // Admin is only allowed to view and delete.
        if (!canAddVisitor && !canEditVisitor) return;

        setLoading(true);
        setError(null);

        try {
            if (editingId) {
                if (!canEditVisitor) return;

                await axios.put(
                    `${API_URL}/api/visitors/${editingId}`,
                    formData,
                    { withCredentials: true }
                );
            } else {
                if (!canAddVisitor) return;

                await axios.post(
                    `${API_URL}/api/visitors`,
                    formData,
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

    // Format date for table display.
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

    // Style status badges.
    const getStatusBadge = (status) => {
        if (status === "Checked-In") {
            return "bg-success text-white";
        }

        if (status === "Checked-Out") {
            return "bg-secondary text-white";
        }

        return "bg-light text-dark border";
    };

    return (
        <div className="container-fluid py-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold text-secondary"
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

            {/* Visitor Form / Admin Read-Only View */}
            {showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={onSubmit}>
                            <div className="row g-3">
                                <div className="col-6">
                                    <label
                                        htmlFor="first_name"
                                        className="form-label fw-semibold"
                                    >
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
                                    <label
                                        htmlFor="last_name"
                                        className="form-label fw-semibold"
                                    >
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
                                    <label
                                        htmlFor="expected_date"
                                        className="form-label fw-semibold"
                                    >
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
                                    <label
                                        htmlFor="expected_time"
                                        className="form-label fw-semibold"
                                    >
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
                                    <label
                                        htmlFor="vehicle_info"
                                        className="form-label fw-semibold"
                                    >
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
                                        required
                                    />
                                </div>
                            </div>

                            {/* Form Buttons */}
                            <div className="d-flex gap-3 mt-4">
                                {!isReadOnly && (
                                    <button
                                        type="submit"
                                        className="btn text-white flex-grow-1"
                                        style={{
                                            backgroundColor: "#695e59",
                                        }}
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
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(initialForm);
                                        setError(null);
                                    }}
                                    disabled={loading}
                                >
                                    {isReadOnly ? "Close" : "Cancel"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* Visitors Table */
                <div className="table-responsive">
                    <table className="table align-middle text-center">
                        <thead style={{ backgroundColor: "#ede6e2" }}>
                            <tr>
                                <th scope="col" className="py-3">
                                    Visitor Name
                                </th>
                                <th scope="col" className="py-3">
                                    Date
                                </th>
                                <th scope="col" className="py-3">
                                    Time
                                </th>
                                <th scope="col" className="py-3">
                                    Vehicle Info
                                </th>
                                <th scope="col" className="py-3">
                                    Status
                                </th>

                                {(canEditVisitor || canDeleteVisitor) && (
                                    <th scope="col" className="py-3">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {displayedVisitors.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={
                                            5 +
                                            (canEditVisitor || canDeleteVisitor
                                                ? 1
                                                : 0)
                                        }
                                        className="py-4 text-muted"
                                    >
                                        No visitors registered yet.
                                    </td>
                                </tr>
                            ) : (
                                displayedVisitors.map((visitor) => (
                                    <tr key={visitor._id}>
                                        <td>
                                            {visitor.first_name}{" "}
                                            {visitor.last_name}
                                        </td>

                                        <td>
                                            {formatDateDisplay(
                                                visitor.expected_date
                                            )}
                                        </td>

                                        <td>{visitor.expected_time || "—"}</td>

                                        <td style={{ whiteSpace: "pre-line" }}>
                                            {visitor.vehicle_info || "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge px-3 py-2 rounded-pill ${getStatusBadge(
                                                    visitor.status
                                                )}`}
                                            >
                                                {visitor.status || "Pending"}
                                            </span>
                                        </td>

                                        {(canEditVisitor ||
                                            canDeleteVisitor) && (
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{
                                                                backgroundColor:
                                                                    "#4155c7",
                                                            }}
                                                            onClick={() =>
                                                                handleView(
                                                                    visitor
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    )}

                                                    {canEditVisitor && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{
                                                                backgroundColor:
                                                                    "#5f6368",
                                                            }}
                                                            onClick={() =>
                                                                handleEdit(
                                                                    visitor
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {canDeleteVisitor && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{
                                                                backgroundColor:
                                                                    "#ca5c5c",
                                                            }}
                                                            onClick={() =>
                                                                handleDelete(
                                                                    visitor._id
                                                                )
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
