
import { useEffect, useState } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Announcements() {
    const userRole = String(getUserRole() || "").toLowerCase();
    const isAdmin = userRole === "admin";

    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    // Fetch announcements from the backend.
    const fetchAnnouncements = async () => {
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
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Clear the form and close it.
    const resetForm = () => {
        setTitle("");
        setContent("");
        setEditingId(null);
        setShowForm(false);
        setError("");
    };

    // Open the form to create an announcement.
    const handleCreate = () => {
        setTitle("");
        setContent("");
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    // Open the form to edit an announcement.
    const handleEdit = (announcement) => {
        setTitle(announcement.title);
        setContent(announcement.content);
        setEditingId(announcement._id);
        setError("");
        setShowForm(true);
    };

    // Create or update an announcement.
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError("Please enter both a title and content.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const announcementData = {
                title: title.trim(),
                content: content.trim(),
            };

            if (editingId) {
                // Update an existing announcement.
                await axios.put(
                    `${API_URL}/api/announcements/${editingId}`,
                    announcementData,
                    { withCredentials: true }
                );
            } else {
                // Create a new announcement.
                await axios.post(
                    `${API_URL}/api/announcements`,
                    announcementData,
                    { withCredentials: true }
                );
            }

            // Close the form and refresh the list.
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
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this announcement?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await axios.delete(
                `${API_URL}/api/announcements/${id}`,
                { withCredentials: true }
            );

            setAnnouncements((previous) =>
                previous.filter((item) => item._id !== id)
            );
        } catch (err) {
            console.error("Error deleting announcement:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to delete announcement."
            );
        }
    };

    // Format the announcement creation date.
    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="container py-4">
            {/* Page heading */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Announcements
                    </h2>

                    <p className="text-muted mb-0">
                        Stay updated with the latest community news.
                    </p>
                </div>

                {/* Show Create button only to Admins when form is closed */}
                {isAdmin && !showForm && (
                    <button
                        type="button"
                        className="btn text-white"
                        style={{ backgroundColor: "#4155c7" }}
                        onClick={handleCreate}
                    >
                        + Create Announcement
                    </button>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Create / Edit form */}
            {isAdmin && showForm && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4">
                            {editingId
                                ? "Edit Announcement"
                                : "Create Announcement"}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            {/* Title */}
                            <div className="mb-3">
                                <label
                                    htmlFor="announcementTitle"
                                    className="form-label fw-semibold"
                                >
                                    Title
                                </label>

                                <input
                                    id="announcementTitle"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter announcement title"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    maxLength={150}
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <label
                                    htmlFor="announcementContent"
                                    className="form-label fw-semibold"
                                >
                                    Content
                                </label>

                                <textarea
                                    id="announcementContent"
                                    className="form-control"
                                    rows="5"
                                    placeholder="Write your announcement..."
                                    value={content}
                                    onChange={(event) =>
                                        setContent(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* Form buttons */}
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
                                          : "Publish Announcement"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Announcements list - hidden while form is open */}
            {!showForm && (
                <>
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
                    ) : announcements.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <h5 className="fw-semibold">
                                    No announcements yet
                                </h5>

                                <p className="text-muted mb-0">
                                    New community announcements will appear here.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {announcements.map((announcement) => (
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
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            handleEdit(
                                                                announcement
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
                                                                announcement._id
                                                            )
                                                        }
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
        </div>
    );
}
