import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";
import ConfirmModal from '../componets/ConfirmModel';

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    issue_type: "Door Latch Problem",
    description: "",
    request_date: new Date().toISOString().split("T")[0],
};

const statusOptions = ["Submitted", "Review", "Assign", "Resolved"];

export default function Maintenance() {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const userRole = String(getUserRole() || "").toLowerCase();

    const isResident = userRole === "resident";
    const isAdmin = userRole === "admin";
    const isGuard = userRole === "guard";

    // Load maintenance requests
    const fetchMaintenance = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const endpoint = isAdmin
                ? `${API_URL}/api/maintenance/allMaintenance`
                : `${API_URL}/api/maintenance`;

            const response = await axios.get(endpoint, {
                withCredentials: true,
            });

            const data = response.data;

            const maintenanceRequests = Array.isArray(data)
                ? data
                : data.requests || data.maintenanceRequests || [];

            setRequests(maintenanceRequests);
        } catch (error) {
            console.error("Error fetching maintenance requests:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to load maintenance requests. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchMaintenance();
    }, [fetchMaintenance]);

    // Open a blank form for a new request
    const handleAddNew = () => {
        if (!isResident) return;

        setFormData({
            ...initialForm,
            request_date: new Date().toISOString().split("T")[0],
        });

        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    // Open a request for editing by a Resident
    const handleEdit = (ticket) => {
        if (!isResident) return;

        setFormData({
            issue_type: ticket.issue_type || "Door Latch Problem",
            description: ticket.description || "",
            request_date: ticket.request_date
                ? String(ticket.request_date).split("T")[0]
                : new Date().toISOString().split("T")[0],
        });

        setEditingId(ticket._id);
        setError("");
        setShowForm(true);
    };

    // Open details in read-only mode for an Admin
    const handleView = (ticket) => {
        if (!isAdmin) return;

        setFormData({
            issue_type: ticket.issue_type || "Door Latch Problem",
            description: ticket.description || "",
            request_date: ticket.request_date
                ? String(ticket.request_date).split("T")[0]
                : "",
        });

        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    // Close the form and return to the maintenance list
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialForm);
        setError("");
    };

    // Update form fields
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    // Create or update a maintenance request
    const onSubmit = async (event) => {
        event.preventDefault();

        if (!isResident) return;

        try {
            setSaving(true);
            setError("");

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

            handleCloseForm();
            await fetchMaintenance();
        } catch (error) {
            console.error("Error saving maintenance request:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to save the maintenance request."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete a maintenance request
    const confirmDelete = async () => {
        if (!deleteTarget || (!isResident && !isAdmin)) return;

        setDeleting(true);

        try {
            setError("");

            await axios.delete(
                `${API_URL}/api/maintenance/${deleteTarget._id}`,
                { withCredentials: true }
            );

            await fetchMaintenance();
        } catch (error) {
            console.error("Error deleting maintenance request:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to delete the maintenance request."
            );
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    // Admin can update only the request status
    const handleStatusChange = async (id, status) => {
        if (!isAdmin) return;

        try {
            setError("");

            await axios.put(
                `${API_URL}/api/maintenance/${id}`,
                { status },
                { withCredentials: true }
            );

            await fetchMaintenance();
        } catch (error) {
            console.error("Error updating maintenance status:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to update the maintenance status."
            );
        }
    };

    // Status badge colours
    const getStatusBadge = (status) => {
        const normalizedStatus = String(status || "")
            .trim()
            .toLowerCase();

        if (
            normalizedStatus === "resolved" ||
            normalizedStatus === "completed"
        ) {
            return "bg-success text-white";
        }

        if (
            normalizedStatus === "assign" ||
            normalizedStatus === "assigned" ||
            normalizedStatus === "in progress"
        ) {
            return "bg-primary text-white";
        }

        if (normalizedStatus === "rejected" ||
            normalizedStatus === "closed") {
            return "bg-secondary text-white";
        }

        if (normalizedStatus === "review") {
            return "bg-warning text-dark";
        }

        return "bg-info text-dark";
    };

    // Match existing status values to the dropdown options
    const getDropdownStatus = (status) => {
        const normalizedStatus = String(status || "")
            .trim()
            .toLowerCase();

        if (
            normalizedStatus === "resolved" ||
            normalizedStatus === "completed"
        ) {
            return "Resolved";
        }

        if (
            normalizedStatus === "assign" ||
            normalizedStatus === "assigned" ||
            normalizedStatus === "in progress"
        ) {
            return "Assign";
        }

        if (normalizedStatus === "review") {
            return "Review";
        }

        return "Submitted";
    };

    // Format dates for display
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Filter requests based on search term
    const filteredRequests = requests.filter((ticket) => {
        const term = searchTerm.toLowerCase();
        const issueType = (ticket.issue_type || "").toLowerCase();
        const description = (ticket.description || "").toLowerCase();
        const status = (ticket.status || "").toLowerCase();

        return (
            issueType.includes(term) ||
            description.includes(term) ||
            status.includes(term)
        );
    });

    return (
        <div className="container-fluid py-2">
            {/* Page heading */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold"
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? isAdmin
                            ? "Maintenance Request Details"
                            : editingId
                              ? "Edit Maintenance Request"
                              : "Create Maintenance Request"
                        : "Maintenance"}
                </h1>

                {!showForm && isResident && (
                    <button
                        type="button"
                        className="btn btn-primary text-white px-4 py-2"

                        onClick={handleAddNew}
                    >
                        + New Request
                    </button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Form or details view */}
            {showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={onSubmit}>
                            <div className="row g-3">
                                {/* Issue type */}
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
                                        onChange={handleChange}
                                        disabled={!isResident}
                                        required
                                    >
                                        <option value="Door Latch Problem">
                                            Door Latch Problem
                                        </option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Heating or Cooling">
                                            Heating or Cooling
                                        </option>
                                        <option value="Appliance">Appliance</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Request date */}
                                <div className="col-12">
                                    <label
                                        htmlFor="request_date"
                                        className="form-label fw-semibold"
                                    >
                                        Request Date
                                    </label>

                                    <input
                                        type="date"
                                        id="request_date"
                                        name="request_date"
                                        className="form-control"
                                        value={formData.request_date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split("T")[0]}
                                        readOnly={!isResident}
                                        required
                                    />
                                </div>

                                {/* Description */}
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
                                        onChange={handleChange}
                                        readOnly={!isResident}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Form buttons */}
                            <div className="d-flex gap-3 mt-4">
                                {isResident && (
                                    <button
                                        type="submit"
                                        className="btn btn-primary text-white flex-grow-1"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Save Changes"
                                                : "Submit"}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary text-white flex-grow-1"
                                    onClick={handleCloseForm}
                                    disabled={saving}
                                >
                                    {isResident ? "Cancel" : "Close"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search Bar Input */}
                    <div className="row mb-3">
                        <div className="col-md-4 col-sm-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by issue, status, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle text-center">
                            <thead style={{ backgroundColor: "#ede6e2" }}>
                                <tr>
                                    <th className="py-3">Issue</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Status</th>

                                    {isAdmin && (
                                        <th className="py-3">Update Status</th>
                                    )}

                                    {(isResident || isAdmin) && (
                                        <th className="py-3">Action</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                3 +
                                                (isAdmin ? 2 : 0) +
                                                (isResident ? 1 : 0)
                                            }
                                            className="py-4 text-muted"
                                        >
                                            Loading maintenance requests...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                3 +
                                                (isAdmin ? 2 : 0) +
                                                (isResident ? 1 : 0)
                                            }
                                            className="py-4 text-muted"
                                        >
                                            {requests.length === 0
                                                ? "No maintenance requests found."
                                                : "No matching maintenance requests found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((ticket) => (
                                        <tr key={ticket._id}>
                                            <td className="fw-semibold">
                                                {ticket.issue_type || "Maintenance Issue"}
                                            </td>

                                            <td>
                                                {formatDate(ticket.request_date)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge px-3 py-2 rounded-pill ${getStatusBadge(
                                                        ticket.status
                                                    )}`}
                                                >
                                                    {ticket.status || "Submitted"}
                                                </span>
                                            </td>

                                            {/* Admin status dropdown */}
                                            {isAdmin && (
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm mx-auto"
                                                        style={{
                                                            minWidth: "140px",
                                                            maxWidth: "160px",
                                                        }}
                                                        aria-label={`Update status for ${
                                                            ticket.issue_type ||
                                                            "maintenance request"
                                                        }`}
                                                        value={getDropdownStatus(
                                                            ticket.status
                                                        )}
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                ticket._id,
                                                                event.target.value
                                                            )
                                                        }
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}

                                            {/* Action buttons */}
                                            {(isResident || isAdmin) && (
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {isAdmin ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary btn-sm text-white px-3"

                                                                    onClick={() =>
                                                                        handleView(ticket)
                                                                    }
                                                                >
                                                                    View
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm text-white px-3"
                                                                    style={{
                                                                        backgroundColor: "#ca5c5c",
                                                                    }}
                                                                    onClick={() =>
                                                                        setDeleteTarget(ticket)
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
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

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm text-white px-3"
                                                                    style={{
                                                                        backgroundColor: "#ca5c5c",
                                                                    }}
                                                                    onClick={() =>
                                                                        setDeleteTarget(ticket)
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
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
                </>
            )}

            <ConfirmModal
                show={!!deleteTarget}
                title="Delete maintenance request"
                message={
                    <>
                        Are you sure you want to delete the maintenance request for{" "}
                        <strong>{deleteTarget?.issue_type}</strong>? This cannot be undone.
                    </>
                }
                confirmText="Delete"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}