import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getLoggedInUser } from "../Auth";
import ConfirmModal from '../componets/ConfirmModel';

const API_URL = import.meta.env.VITE_API_URL || "";

const DELIVERY_TYPES = [
    "Package / Parcel",
    "Food Delivery",
    "Courier Service",
];

const PICKUP_LOCATIONS = ["Security Desk", "Locker"];

const initialForm = {
    resident_unit: "",
    delivery_type: "Package / Parcel",
    courier_name: "",
    pickup_location: "Security Desk",
};

export default function Delivery() {
    const user = getLoggedInUser();
    const role = String(user?.role || "").toLowerCase();
    const isGuard = role === "guard";
    const isResident = role === "resident";
    const hasDeliveryAccess = isGuard || isResident;

    const [deliveries, setDeliveries] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(
                `${API_URL}/api/deliveries`,
                { withCredentials: true }
            );
            const data = response.data;
            setDeliveries(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.deliveries)
                    ? data.deliveries
                    : []
            );
        } catch (err) {
            console.error("Fetch deliveries error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to load deliveries."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
        setError("");
    };

    const handleAddNew = () => {
        if (!isGuard) return;
        setFormData(initialForm);
        setEditingId(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isGuard) {
            setError("Only guards can record or edit deliveries.");
            return;
        }
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            if (editingId) {
                await axios.put(
                    `${API_URL}/api/deliveries/${editingId}`,
                    formData,
                    { withCredentials: true }
                );
                setSuccess("Delivery updated successfully.");
            } else {
                await axios.post(
                    `${API_URL}/api/deliveries`,
                    formData,
                    { withCredentials: true }
                );
                setSuccess("Delivery recorded successfully.");
            }
            resetForm();
            await fetchDeliveries();
        } catch (err) {
            console.error("Save delivery error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to save delivery."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (delivery) => {
        if (!isGuard) return;
        setFormData({
            resident_unit: delivery.resident_unit || "",
            delivery_type: delivery.delivery_type || "Package / Parcel",
            courier_name: delivery.courier_name || "",
            pickup_location: delivery.pickup_location || "Security Desk",
        });
        setEditingId(delivery._id);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget || !isGuard) return;
        const id = deleteTarget._id;
        setError("");
        setSuccess("");
        setDeleting(true);
        try {
            await axios.delete(
                `${API_URL}/api/deliveries/${id}`,
                { withCredentials: true }
            );
            if (editingId === id) {
                resetForm();
            }
            setSuccess("Delivery deleted successfully.");
            await fetchDeliveries();
        } catch (err) {
            console.error("Delete delivery error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to delete delivery."
            );
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "—";
        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (!date) return "—";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "—";
        return parsedDate.toLocaleTimeString("en-CA", {
            timeZone: "America/Toronto",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const filteredDeliveries = deliveries.filter((delivery) => {
        const term = searchTerm.toLowerCase();
        return [
            delivery.resident_unit,
            delivery.delivery_type,
            delivery.courier_name,
            delivery.guard_name,
            delivery.pickup_location,
        ].some((value) =>
            String(value || "").toLowerCase().includes(term)
        );
    });

    if (!hasDeliveryAccess) {
        return (
            <div className="container-fluid py-2">
                <div className="alert alert-danger" role="alert">
                    You are not authorized to access delivery management.
                    Please log in again if you believe this is an error.
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold"
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? editingId
                            ? "Edit Delivery"
                            : "Record New Delivery"
                        : isGuard
                        ? "Deliveries"
                        : "My Deliveries"}
                </h1>

                {!showForm && isGuard && (
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="btn btn-primary text-white px-4 py-2"

                    >
                        + Record Delivery
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success" role="status">
                    {success}
                </div>
            )}

            {showForm && isGuard ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label htmlFor="resident_unit" className="form-label fw-semibold">
                                        Resident Unit *
                                    </label>
                                    <input
                                        type="text"
                                        id="resident_unit"
                                        name="resident_unit"
                                        className="form-control"
                                        placeholder="e.g. 1205"
                                        value={formData.resident_unit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="delivery_type" className="form-label fw-semibold">
                                        Delivery Type *
                                    </label>
                                    <select
                                        id="delivery_type"
                                        name="delivery_type"
                                        className="form-select"
                                        value={formData.delivery_type}
                                        onChange={handleChange}
                                        required
                                    >
                                        {DELIVERY_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label htmlFor="courier_name" className="form-label fw-semibold">
                                        Courier Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="courier_name"
                                        name="courier_name"
                                        className="form-control"
                                        placeholder="e.g. Amazon"
                                        value={formData.courier_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label htmlFor="pickup_location" className="form-label fw-semibold">
                                        Pickup Location *
                                    </label>
                                    <select
                                        id="pickup_location"
                                        name="pickup_location"
                                        className="form-select"
                                        value={formData.pickup_location}
                                        onChange={handleChange}
                                        required
                                    >
                                        {PICKUP_LOCATIONS.map((location) => (
                                            <option key={location} value={location}>
                                                {location}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex gap-3 mt-4">
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

                                <button
                                    type="button"
                                    className="btn btn-secondary text-white flex-grow-1"

                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row mb-3">
                        <div className="col-md-4 col-sm-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by unit, courier, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle text-center">
                            <thead style={{ backgroundColor: "#ede6e2" }}>
                                <tr>
                                    <th className="py-3">Unit</th>
                                    <th className="py-3">Delivery Type</th>
                                    <th className="py-3">Courier</th>
                                    <th className="py-3">Guard</th>
                                    <th className="py-3">Pickup Location</th>
                                    <th className="py-3">Logged Date</th>
                                    <th className="py-3">Time</th>
                                    {isGuard && <th className="py-3">Action</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={isGuard ? 8 : 7} className="py-4 text-muted">
                                            Loading deliveries...
                                        </td>
                                    </tr>
                                ) : filteredDeliveries.length === 0 ? (
                                    <tr>
                                        <td colSpan={isGuard ? 8 : 7} className="py-4 text-muted">
                                            {deliveries.length === 0
                                                ? "No delivery records found."
                                                : "No matching deliveries found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDeliveries.map((delivery) => (
                                        <tr key={delivery._id}>
                                            <td className="fw-semibold">
                                                {delivery.resident_unit}
                                            </td>
                                            <td>{delivery.delivery_type}</td>
                                            <td>{delivery.courier_name}</td>
                                            <td>{delivery.guard_name || "—"}</td>
                                            <td>
                                                <span
                                                    className={`badge px-3 py-2 rounded-pill ${
                                                        delivery.pickup_location === "Locker"
                                                            ? "bg-info text-dark"
                                                            : "bg-secondary text-white"
                                                    }`}
                                                >
                                                    {delivery.pickup_location || "—"}
                                                </span>
                                            </td>
                                            <td>{formatDate(delivery.logged_at)}</td>
                                            <td>{formatTime(delivery.logged_at)}</td>
                                            {isGuard && (
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#5f6368" }}
                                                            onClick={() => handleEdit(delivery)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#ca5c5c" }}
                                                            onClick={() => setDeleteTarget(delivery)}
                                                        >
                                                            Delete
                                                        </button>
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
                title="Delete delivery"
                message={
                    <>
                        Are you sure you want to delete the{" "}
                        <strong>{deleteTarget?.courier_name}</strong> delivery for unit{" "}
                        <strong>{deleteTarget?.resident_unit}</strong>? This cannot be
                        undone.
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