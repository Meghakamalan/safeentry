import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";
import ConfirmModal from '../componets/ConfirmModel';

const initialForm = {
    issue_type: "Door Latch Problem",
    description: "",
    request_date: new Date().toISOString().split("T")[0],
};

const statusOptions = ["Review", "Assign", "Resolved"];

export default function Maintenance() {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
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

        return "bg-warning text-dark";
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

        return "Review";
    };

    // Format dates for display
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString();
    };

    return (
        <div className="container-fluid py-2">
            {/* Page heading */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="mb-1">
                        {showForm
                            ? isAdmin
                                ? "Maintenance Request Details"
                                : editingId
                                  ? "Edit Maintenance Request"
                                  : "Create Maintenance Request"
                            : "Maintenance"}
                    </h2>

                    <p className="text-muted mb-0">
                        {showForm && isAdmin &&
                            "View the details of this maintenance request."}

                        {showForm && isResident && editingId &&
                            "Update your maintenance request."}

                        {showForm && isResident && !editingId &&
                            "Submit a new maintenance request."}

                        {!showForm && isResident &&
                            "Submit and manage your maintenance requests."}

                        {!showForm && isAdmin &&
                            "View requests, update statuses, and manage maintenance records."}

                        {!showForm && isGuard &&
                            "View maintenance requests and their current status."}
                    </p>
                </div>

                {!showForm && isResident && (
                    <button
                        type="button"
                        className="btn text-white"
                        style={{ backgroundColor: "#4155c7" }}
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

                    <button
                        type="button"
                        className="btn-close float-end"
                        aria-label="Close error message"
                        onClick={() => setError("")}
                    />
                </div>
            )}

            {/* Form or details view */}
            {showForm && (
                <div
                    className="card shadow-sm mx-auto mb-4"
                    style={{ maxWidth: "600px" }}
                >
                    <div
                        className="card-header text-white"
                        style={{ backgroundColor: "#4155c7" }}
                    >
                        <h5 className="mb-0">
                            {isAdmin
                                ? "Request Details"
                                : editingId
                                  ? "Edit Request"
                                  : "New Request"}
                        </h5>
                    </div>

                    <div className="card-body p-4">
                        <form onSubmit={onSubmit}>
                            {/* Issue type */}
                            <div className="mb-3">
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
                            <div className="mb-3">
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
                                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                                    readOnly={!isResident}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
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

                            {/* Resident form buttons */}
                            {isResident && (
                                <div className="d-flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        className="btn text-white"
                                        style={{
                                            backgroundColor: "#4155c7",
                                        }}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                              ? "Save Changes"
                                              : "Submit Request"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn text-white"
                                        style={{
                                            backgroundColor: "#5f6368",
                                        }}
                                        disabled={saving}
                                        onClick={handleCloseForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {/* Admin details close button */}
                            {!isResident && (
                                <button
                                    type="button"
                                    className="btn text-white"
                                    style={{
                                        backgroundColor: "#5f6368",
                                    }}
                                    onClick={handleCloseForm}
                                >
                                    Close
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORTANT: Hide the entire list while the form/details are open */}
            {!showForm && (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                        {loading ? (
                            <div
                                className="text-center py-5"
                                role="status"
                            >
                                <div
                                    className="spinner-border"
                                    style={{ color: "#4155c7" }}
                                    aria-hidden="true"
                                />

                                <p className="mt-2 mb-0">
                                    Loading maintenance requests...
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr
                                            style={{
                                                backgroundColor: "#ede6e2",
                                            }}
                                        >
                                            <th
                                                scope="col"
                                                className="text-center py-3"
                                            >
                                                Issue
                                            </th>

                                            <th
                                                scope="col"
                                                className="text-center py-3"
                                            >
                                                Date
                                            </th>

                                            <th
                                                scope="col"
                                                className="text-center py-3"
                                            >
                                                Status
                                            </th>

                                            {isAdmin && (
                                                <th
                                                    scope="col"
                                                    className="text-center py-3"
                                                >
                                                    Update Status
                                                </th>
                                            )}

                                            {(isResident || isAdmin) && (
                                                <th
                                                    scope="col"
                                                    className="text-center py-3"
                                                >
                                                    Action
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        3 +
                                                        (isAdmin ? 2 : 0) +
                                                        (isResident ? 1 : 0)
                                                    }
                                                    className="text-center py-5 text-muted"
                                                >
                                                    No maintenance requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            requests.map((ticket) => (
                                                <tr key={ticket._id}>
                                                    <td className="text-center">
                                                        <span className="fw-semibold">
                                                            {ticket.issue_type ||
                                                                "Maintenance Issue"}
                                                        </span>
                                                    </td>

                                                    <td className="text-center">
                                                        {formatDate(
                                                            ticket.request_date
                                                        )}
                                                    </td>

                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${getStatusBadge(
                                                                ticket.status
                                                            )}`}
                                                        >
                                                            {ticket.status ||
                                                                "Review"}
                                                        </span>
                                                    </td>

                                                    {/* Admin status dropdown */}
                                                    {isAdmin && (
                                                        <td className="text-center">
                                                            <select
                                                                className="form-select form-select-sm mx-auto"
                                                                style={{
                                                                    minWidth:
                                                                        "140px",
                                                                    maxWidth:
                                                                        "160px",
                                                                }}
                                                                aria-label={`Update status for ${
                                                                    ticket.issue_type ||
                                                                    "maintenance request"
                                                                }`}
                                                                value={getDropdownStatus(
                                                                    ticket.status
                                                                )}
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleStatusChange(
                                                                        ticket._id,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                {statusOptions.map(
                                                                    (status) => (
                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            {
                                                                                status
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </td>
                                                    )}

                                                    {/* Action buttons */}
                                                    {(isResident || isAdmin) && (
                                                        <td className="text-center">
                                                            <div className="d-flex justify-content-center flex-wrap gap-2">
                                                                {isAdmin ? (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm text-white"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#4155c7",
                                                                            }}
                                                                            onClick={() =>
                                                                                handleView(
                                                                                    ticket
                                                                                )
                                                                            }
                                                                        >
                                                                            View
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm text-white"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#ca5c5c",
                                                                            }}
                                                                            onClick={() => setDeleteTarget(ticket)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm text-white"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#5f6368",
                                                                            }}
                                                                            onClick={() =>
                                                                                handleEdit(
                                                                                    ticket
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm text-white"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "#ca5c5c",
                                                                            }}
                                                                            onClick={() => setDeleteTarget(ticket)}
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
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal
                show={!!deleteTarget}
                title="Delete maintenance request"
                message={
                    <>
                        Are you sure you want to delete this{" "}
                        <strong>
                            {deleteTarget?.issue_type || "maintenance"}
                        </strong>{" "}
                        request? This cannot be undone.
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