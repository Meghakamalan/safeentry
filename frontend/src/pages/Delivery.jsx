import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getLoggedInUser } from "../Auth";

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
    console.log("Logged-in user:", user);

    const role = String(user?.role || "").toLowerCase();
    const isGuard = role === "guard";
    const isResident = role === "resident";
    const hasDeliveryAccess = isGuard || isResident;

    const [deliveries, setDeliveries] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");

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
            delivery_type:
                delivery.delivery_type || "Package / Parcel",
            courier_name: delivery.courier_name || "",
            pickup_location:
                delivery.pickup_location || "Security Desk",
        });

        setEditingId(delivery._id);
        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        if (!isGuard) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this delivery?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

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
        }
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleDateString("en-CA", {
            timeZone: "America/Toronto",
            year: "numeric",
            month: "short",
            day: "2-digit",
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

    const searchText = search.trim().toLowerCase();

    const filteredDeliveries = deliveries.filter((delivery) =>
        [
            delivery.resident_unit,
            delivery.delivery_type,
            delivery.courier_name,
            delivery.guard_name,
            delivery.pickup_location,
        ].some((value) =>
            String(value || "").toLowerCase().includes(searchText)
        )
    );

    if (!hasDeliveryAccess) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger" role="alert">
                    You are not authorized to access delivery management.
                    Please log in again if you believe this is an error.
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <div>
                    <h2 className="fw-bold mb-1">
                        {isGuard
                            ? "Delivery Management"
                            : "My Deliveries"}
                    </h2>

                    <p className="text-muted mb-0">
                        {isGuard
                            ? "Record and manage resident deliveries."
                            : "View delivery records for your unit."}
                    </p>
                </div>

                <span className="badge text-bg-primary fs-6">
                    {filteredDeliveries.length} Deliveries
                </span>
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

            {/* Only guards can record or edit deliveries */}
            {isGuard && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-semibold">
                            {editingId
                                ? "Edit Delivery"
                                : "Record New Delivery"}
                        </h5>
                    </div>

                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6 col-lg-3">
                                    <label
                                        htmlFor="resident_unit"
                                        className="form-label"
                                    >
                                        Resident Unit *
                                    </label>

                                    <input
                                        type="text"
                                        id="resident_unit"
                                        name="resident_unit"
                                        className="form-control"
                                        placeholder="e.g. 120"
                                        value={formData.resident_unit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 col-lg-3">
                                    <label
                                        htmlFor="delivery_type"
                                        className="form-label"
                                    >
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
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6 col-lg-3">
                                    <label
                                        htmlFor="courier_name"
                                        className="form-label"
                                    >
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

                                <div className="col-md-6 col-lg-3">
                                    <label
                                        htmlFor="pickup_location"
                                        className="form-label"
                                    >
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
                                        {PICKUP_LOCATIONS.map(
                                            (location) => (
                                                <option
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                          ? "Update Delivery"
                                          : "Record Delivery"}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={resetForm}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>

                            
                        </form>
                    </div>
                </div>
            )}

            {/* Delivery history: all for guards, own unit for residents */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                    <div className="row align-items-center g-3">
                        <div className="col-md">
                            <h5 className="mb-0 fw-semibold">
                                {isGuard
                                    ? "Delivery History"
                                    : "My Delivery History"}
                            </h5>
                        </div>

                        <div className="col-md-5">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Search deliveries..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search deliveries"
                            />
                        </div>

                        <div className="col-md-auto">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={fetchDeliveries}
                                disabled={loading}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="text-muted mt-2 mb-0">
                                Loading deliveries...
                            </p>
                        </div>
                    ) : filteredDeliveries.length === 0 ? (
                        <div className="text-center py-5">
                            <h6 className="fw-semibold">
                                No deliveries found
                            </h6>

                            <p className="text-muted mb-0">
                                {search
                                    ? "Try a different search."
                                    : "There are no delivery records to display."}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-3">Unit</th>
                                        <th>Delivery Type</th>
                                        <th>Courier</th>
                                        <th>Guard</th>
                                        <th>Pickup Location</th>
                                        <th>Logged Date</th>
                                        <th>Time</th>

                                        {isGuard && (
                                            <th className="text-end px-3">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredDeliveries.map((delivery) => (
                                        <tr key={delivery._id}>
                                            <td className="px-3 fw-semibold">
                                                {delivery.resident_unit}
                                            </td>

                                            <td>
                                                {delivery.delivery_type}
                                            </td>

                                            <td>
                                                {delivery.courier_name}
                                            </td>

                                            <td>
                                                {delivery.guard_name || "—"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${
                                                        delivery.pickup_location ===
                                                        "Locker"
                                                            ? "text-bg-info"
                                                            : "text-bg-secondary"
                                                    }`}
                                                >
                                                    {delivery.pickup_location ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    delivery.logged_at
                                                )}
                                            </td>

                                            <td>
                                                {formatTime(
                                                    delivery.logged_at
                                                )}
                                            </td>

                                            {isGuard && (
                                                <td className="text-end px-3">
                                                    <div className="d-inline-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    delivery
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    delivery._id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!loading && filteredDeliveries.length > 0 && (
                    <div className="card-footer bg-white text-muted small">
                        Showing {filteredDeliveries.length} of{" "}
                        {deliveries.length} deliveries
                    </div>
                )}
            </div>
        </div>
    );
}
