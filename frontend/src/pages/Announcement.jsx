import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";
import ConfirmModal from '../componets/ConfirmModel';

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    title: "",
    content: "",
};

export default function Announcements() {
    const userRole = String(getUserRole() || "").toLowerCase();
    const isAdmin = userRole === "admin";

    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch announcements from the backend.
    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/announcements`,
                { withCredentials: true }
            );

            setAnnouncements(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.announcements || []
            );
        } catch (err) {
            console.error("Error fetching announcements:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to load announcements."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Clear the form and close it.
    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
        setError("");
    };

    // Open the form to create an announcement.
    const handleCreate = () => {
        setFormData(initialForm);
        setEditingId(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Open the form to edit an announcement.
    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title || "",
            content: announcement.content || "",
        });
        setEditingId(announcement._id);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Update form fields.
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Create or update an announcement.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setError("Please enter both a title and content.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const announcementData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
            };

            if (editingId) {
                await axios.put(
                    `${API_URL}/api/announcements/${editingId}`,
                    announcementData,
                    { withCredentials: true }
                );
                setSuccess("Announcement updated successfully.");
            } else {
                await axios.post(
                    `${API_URL}/api/announcements`,
                    announcementData,
                    { withCredentials: true }
                );
                setSuccess("Announcement published successfully.");
            }

            resetForm();
            await fetchAnnouncements();
        } catch (err) {
            console.error("Error saving announcement:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to save announcement."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete an announcement.
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget._id;

        setDeleting(true);

        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${API_URL}/api/announcements/${id}`,
                { withCredentials: true }
            );

            setAnnouncements((previous) =>
                previous.filter((item) => item._id !== id)
            );
            setSuccess("Announcement deleted successfully.");
        } catch (err) {
            console.error("Error deleting announcement:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to delete announcement."
            );
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    // Format the announcement creation date.
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Filter announcements based on search term.
    const filteredAnnouncements = announcements.filter((item) => {
        const term = searchTerm.toLowerCase();
        const titleText = (item.title || "").toLowerCase();
        const contentText = (item.content || "").toLowerCase();

        return titleText.includes(term) || contentText.includes(term);
    });

    return (
        <div className="container-fluid py-2">
            {/* Page heading */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold "
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? editingId
                            ? "Edit Announcement"
                            : "Create Announcement"
                        : "Announcements"}
                </h1>

                {isAdmin && !showForm && (
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="btn btn-primary text-white px-4 py-2"
                        // style={{ backgroundColor: "#4155c7", borderRadius: "4px" }}
                    >
                        + Create Announcement
                    </button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="alert alert-success" role="alert">
                    {success}
                </div>
            )}

            {/* Create / Edit form */}
            {isAdmin && showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label
                                        htmlFor="title"
                                        className="form-label fw-semibold"
                                    >
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        className="form-control"
                                        placeholder="Enter announcement title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        maxLength={150}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        htmlFor="content"
                                        className="form-label fw-semibold"
                                    >
                                        Content
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        className="form-control"
                                        rows="5"
                                        placeholder="Write your announcement..."
                                        value={formData.content}
                                        onChange={handleChange}
                                        required
                                    />
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
                                    // style={{ backgroundColor: "#ca5c5c" }}
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
                    {/* Search Bar Input */}
                    <div className="row mb-3">
                        <div className="col-md-4 col-sm-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search announcements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border"
                                role="status"
                                aria-label="Loading announcements"
                            />
                            <p className="text-muted mt-3">
                                Loading announcements...
                            </p>
                        </div>
                    ) : filteredAnnouncements.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <h5 className="fw-semibold">
                                    {announcements.length === 0
                                        ? "No announcements yet"
                                        : "No matching announcements found"}
                                </h5>
                                <p className="text-muted mb-0">
                                    {announcements.length === 0
                                        ? "New community announcements will appear here."
                                        : "Try a different search term."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {filteredAnnouncements.map((announcement) => (
                                <div
                                    className="card border-0 shadow-sm"
                                    key={announcement._id}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                                            <div className="flex-grow-1">
                                                <h5 className="fw-bold mb-2">
                                                    {announcement.title}
                                                </h5>

                                                <p
                                                    className="mb-3"
                                                    style={{
                                                        whiteSpace: "pre-wrap",
                                                        overflowWrap: "anywhere",
                                                    }}
                                                >
                                                    {announcement.content}
                                                </p>

                                                <small className="text-muted">
                                                    <span className="fw-semibold">
                                                        Created:
                                                    </span>{" "}
                                                    {formatDate(
                                                        announcement.createdAt
                                                    )}
                                                </small>
                                            </div>

                                            {/* Admin controls */}
                                            {isAdmin && (
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-white px-3"
                                                        style={{ backgroundColor: "#5f6368" }}
                                                        onClick={() =>
                                                            handleEdit(announcement)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-white px-3"
                                                        style={{ backgroundColor: "#ca5c5c" }}
                                                        onClick={() => setDeleteTarget(announcement)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                show={!!deleteTarget}
                title="Delete announcement"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong>{deleteTarget?.title}</strong>? This cannot be
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