import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    issue_type: "Door Latch Problem",
    description: "",
    request_date: new Date().toISOString().split("T")[0],
};

const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userRole = String(getUserRole() || "").toLowerCase();

    const isResident = userRole === "resident";
    const isAdmin = userRole === "admin";
    const isGuard = userRole === "guard";

    // Fetch requests based on the user's role
    const fetchMaintenance = useCallback(async () => {
        try {
            setError(null);

            const endpoint = isAdmin
                ? `${API_URL}/api/maintenance/allMaintenance`
                : `${API_URL}/api/maintenance`;

            const response = await axios.get(endpoint, {
                withCredentials: true,
            });

            setRequests(response.data);

            console.log("Maintenance requests fetched:", response.data);
        } catch (error) {
            console.error(
                "Error fetching maintenance requests:",
                error.response?.status,
                error.response?.data || error.message
            );

            if (error.response?.status === 401) {
                setError("Authentication required. Please log in again.");
            } else if (error.response?.status === 403) {
                setError("You do not have permission to view these requests.");
            } else {
                setError("Failed to fetch maintenance requests.");
            }
        }
    }, [isAdmin]);

    // Fetch requests when the component loads or role-dependent callback changes
    useEffect(() => {
        fetchMaintenance();
    }, [fetchMaintenance]);

    // Handle form inputs
    const onChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Open form for creating a new request
    const handleAddNew = () => {
        setFormData({
            ...initialForm,
            request_date: new Date().toISOString().split("T")[0],
        });

        setEditingId(null);
        setError(null);
        setShowForm(true);
    };

    // Edit an existing request
    const handleEdit = (ticket) => {
        const formattedDate = ticket.request_date
            ? new Date(ticket.request_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        setFormData({
            issue_type: ticket.issue_type,
            description: ticket.description,
            request_date: formattedDate,
        });

        setEditingId(ticket._id);
        setError(null);
        setShowForm(true);
    };

    // Delete a request
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this maintenance request?"
        );

        if (!confirmed) return;

        try {
            setError(null);

            await axios.delete(
                `${API_URL}/api/maintenance/${id}`,
                { withCredentials: true }
            );

            await fetchMaintenance();
        } catch (error) {
            console.error("Failed to delete maintenance request:", error);

            setError(
                error.response?.data?.message ||
                "Failed to delete maintenance request."
            );
        }
    };

    // Submit a new request or update an existing one
    const onSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            if (editingId) {
                await axios.put(
                    `${API_URL}/api/maintenance/${editingId}`,
                    formData,
                    { withCredentials: true }
                );
            } else {
                await axios.post(
                    `${API_URL}/api/maintenance`,
                    formData,
                    { withCredentials: true }
                );
            }

            await fetchMaintenance();

            setShowForm(false);
            setFormData(initialForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error submitting maintenance form:", error);

            setError(
                error.response?.data?.message ||
                "Failed to submit request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";

        const dateObj = new Date(dateString);

        return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Get Bootstrap status badge
    const getStatusBadge = (status) => {
        const normalizedStatus = String(status || "").toLowerCase();

        if (
            normalizedStatus === "resolved" ||
            normalizedStatus === "completed"
        ) {
            return "bg-success text-white";
        }

        if (normalizedStatus === "in progress") {
            return "bg-primary text-white";
        }

        if (
            normalizedStatus === "closed" ||
            normalizedStatus === "rejected"
        ) {
            return "bg-secondary text-white";
        }

        return "bg-warning text-dark";
    };

    return (
        <div className="container-fluid py-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold"
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? editingId
                            ? "Edit Maintenance Request"
                            : "New Maintenance Request"
                        : "Maintenance"}
                </h1>

                {!showForm && isResident && (
                    <button
                        onClick={handleAddNew}
                        className="btn text-white px-4 py-2"
                        style={{
                            backgroundColor: "#2b63d9",
                            borderRadius: "6px",
                        }}
                    >
                        + New Request
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Form */}
            {showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={onSubmit}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label
                                        htmlFor="issue_type"
                                        className="form-label fw-semibold"
                                    >
                                        Issue Type
                                    </label>

                                    <select
                                        id="issue_type"
                                        name="issue_type"
                                        className="form-select"
                                        value={formData.issue_type}
                                        onChange={onChange}
                                        required
                                    >
                                        <option value="Door Latch Problem">
                                            Door Latch Problem
                                        </option>
                                        <option value="Leaking Sink">
                                            Leaking Sink
                                        </option>
                                        <option value="Air Conditioning Unit Failure">
                                            Air Conditioning Unit Failure
                                        </option>
                                        <option value="Light Replacement">
                                            Light Replacement
                                        </option>
                                        <option value="Thermometer Replacement">
                                            Thermometer Replacement
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label
                                        htmlFor="request_date"
                                        className="form-label fw-semibold"
                                    >
                                        Date
                                    </label>

                                    <input
                                        id="request_date"
                                        type="date"
                                        name="request_date"
                                        className="form-control"
                                        value={formData.request_date}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        htmlFor="description"
                                        className="form-label fw-semibold"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Describe the maintenance issue..."
                                        value={formData.description}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Form buttons */}
                            <div className="d-flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="btn text-white flex-grow-1"
                                    style={{ backgroundColor: "#5f6368" }}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Ticket"
                                            : "Submit Ticket"}
                                </button>

                                <button
                                    type="button"
                                    className="btn text-white flex-grow-1"
                                    style={{ backgroundColor: "#ca5c5c" }}
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setError(null);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                /* Maintenance table */
                <div className="table-responsive">
                    <table className="table align-middle text-center">
                        <thead style={{ backgroundColor: "#f0f4f8" }}>
                            <tr>
                                <th scope="col" className="py-3">
                                    Issue
                                </th>
                                <th scope="col" className="py-3">
                                    Date
                                </th>
                                <th scope="col" className="py-3">
                                    Status
                                </th>
                                <th scope="col" className="py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {requests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="py-4 text-muted"
                                    >
                                        {isResident
                                            ? 'No maintenance requests submitted yet. Click "+ New Request" to create one.'
                                            : "No maintenance requests found."}
                                    </td>
                                </tr>
                            ) : (
                                requests.map((ticket) => (
                                    <tr key={ticket._id}>
                                        <td>{ticket.issue_type}</td>

                                        <td>
                                            {formatDateDisplay(
                                                ticket.request_date
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge px-3 py-2 rounded-pill ${getStatusBadge(
                                                    ticket.status
                                                )}`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                {/* Residents can edit their own requests.
                                                    Admins can edit any request. */}
                                                {(isResident || isAdmin) && (
                                                    <button
                                                        className="btn btn-sm text-white px-3"
                                                        style={{
                                                            backgroundColor: "#5f6368",
                                                        }}
                                                        onClick={() =>
                                                            handleEdit(ticket)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {(isResident || isAdmin) && (
                                                    <button
                                                        className="btn btn-sm text-white px-3"
                                                        style={{
                                                            backgroundColor: "#ca5c5c",
                                                        }}
                                                        onClick={() =>
                                                            handleDelete(ticket._id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
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

export default Maintenance;
