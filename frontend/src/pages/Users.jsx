import { useEffect, useState } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";
import ConfirmModal from '../componets/ConfirmModel';

const API_URL = import.meta.env.VITE_API_URL || "";

const initialForm = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    unit_number: "",
    password: "",
    role: "Resident",
};

export default function Users() {
    const userRole = String(getUserRole() || "").toLowerCase();
    const isAdmin = userRole === "admin";

    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch all users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/api/users`, {
                withCredentials: true,
            });

            const data = response.data;

            setUsers(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.users)
                      ? data.users
                      : []
            );
        } catch (err) {
            console.error("Fetch users error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    // Update form fields
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({ ...initialForm });
        setEditingId(null);
        setShowForm(false);
        setError("");
    };

    // Open create-user form
    const handleAddUser = () => {
        resetForm();
        setSuccess("");
        setShowForm(true);
    };

    // Open edit-user form
    const handleEdit = (user) => {
        setFormData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            unit_number: user.unit_number || "",
            password: "",
            role: user.role || "Resident",
        });

        setEditingId(user._id || user.id);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    // Create or update user
    const handleSubmit = async (e) => {
        e.preventDefault();

        const wasEditing = Boolean(editingId);

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const userData = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                unit_number: formData.unit_number.trim(),
                role: formData.role,
            };

            if (wasEditing) {
                await axios.put(
                    `${API_URL}/api/users/${editingId}`,
                    userData,
                    {
                        withCredentials: true,
                    }
                );
            } else {
                await axios.post(
                    `${API_URL}/api/users`,
                    {
                        ...userData,
                        password: formData.password,
                    },
                    {
                        withCredentials: true,
                    }
                );
            }

            resetForm();
            await fetchUsers();

            setSuccess(
                wasEditing
                    ? "User updated successfully."
                    : "User created successfully."
            );
        } catch (err) {
            console.error("Save user error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to save user."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete user
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget._id || deleteTarget.id;

        try {
            setDeletingId(id);
            setError("");
            setSuccess("");

            await axios.delete(`${API_URL}/api/users/${id}`, {
                withCredentials: true,
            });

            setUsers((previous) =>
                previous.filter(
                    (user) => String(user._id || user.id) !== String(id)
                )
            );

            setSuccess("User deleted successfully.");
        } catch (err) {
            console.error("Delete user error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete user."
            );
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        const firstName = (user.first_name || "").toLowerCase();
        const lastName = (user.last_name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const unitNumber = (user.unit_number || "").toLowerCase();
        const role = (user.role || "").toLowerCase();

        return (
            firstName.includes(term) ||
            lastName.includes(term) ||
            email.includes(term) ||
            unitNumber.includes(term) ||
            role.includes(term)
        );
    });

    // Only admins can manage users
    if (!isAdmin) {
        return (
            <div className="container-fluid py-2">
                <div className="alert alert-danger" role="alert">
                    You do not have permission to access this page.
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-2">
            {/* Page heading */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1
                    className="h3 fw-bold"
                    style={{ color: "#1f3a52" }}
                >
                    {showForm
                        ? editingId
                          ? "Edit User"
                          : "Create User"
                        : "Users"}
                </h1>

                {!showForm && (
                    <button
                        type="button"
                        onClick={handleAddUser}
                        className="btn btn-primary text-white px-4 py-2"
                        // style={{ backgroundColor: "#4155c7", borderRadius: "4px" }}
                    >
                        + Add User
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
            {showForm ? (
                <div className="d-flex justify-content-center mt-3">
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* First name */}
                                <div className="col-6">
                                    <label
                                        htmlFor="first_name"
                                        className="form-label fw-semibold"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="first_name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        autoComplete="given-name"
                                        required
                                    />
                                </div>

                                {/* Last name */}
                                <div className="col-6">
                                    <label
                                        htmlFor="last_name"
                                        className="form-label fw-semibold"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        autoComplete="family-name"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-12">
                                    <label
                                        htmlFor="email"
                                        className="form-label fw-semibold"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-12">
                                    <label
                                        htmlFor="phone"
                                        className="form-label fw-semibold"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                        required
                                    />
                                </div>

                                {/* Unit number */}
                                <div className="col-12">
                                    <label
                                        htmlFor="unit_number"
                                        className="form-label fw-semibold"
                                    >
                                        Unit Number
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="unit_number"
                                        name="unit_number"
                                        value={formData.unit_number}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Password: only when creating */}
                                {!editingId && (
                                    <div className="col-12">
                                        <label
                                            htmlFor="password"
                                            className="form-label fw-semibold"
                                        >
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            minLength={8}
                                            required
                                        />
                                        <div className="form-text text-muted">
                                            Password must be at least 8 characters.
                                        </div>
                                    </div>
                                )}

                                {/* Role */}
                                <div className="col-12">
                                    <label
                                        htmlFor="role"
                                        className="form-label fw-semibold"
                                    >
                                        User Role
                                    </label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Resident">Resident</option>
                                        <option value="Guard">Guard</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {/* Form actions */}
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
                /* Users list view */
                <>
                    {/* Search Bar Input */}
                    <div className="row mb-3">
                        <div className="col-md-4 col-sm-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, email, unit, or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle text-center">
                            <thead style={{ backgroundColor: "#ede6e2" }}>
                                <tr>
                                    <th className="py-3">Name</th>
                                    <th className="py-3">Email</th>
                                    <th className="py-3">Phone</th>
                                    <th className="py-3">Unit</th>
                                    <th className="py-3">Role</th>
                                    <th className="py-3">Created</th>
                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-4 text-muted">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-4 text-muted">
                                            {users.length === 0
                                                ? "No users found."
                                                : "No matching users found."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const id = user._id || user.id;

                                        return (
                                            <tr key={id}>
                                                <td className="fw-semibold">
                                                    {user.first_name} {user.last_name}
                                                </td>

                                                <td>{user.email}</td>

                                                <td>{user.phone || "—"}</td>

                                                <td>{user.unit_number || "—"}</td>

                                                <td>
                                                    <span
                                                        className={`badge px-3 py-2 rounded-pill ${
                                                            String(user.role).toLowerCase() === "admin"
                                                                ? "bg-danger text-white"
                                                                : String(user.role).toLowerCase() === "guard"
                                                                  ? "bg-warning text-dark"
                                                                  : "bg-primary text-white"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>

                                                <td>
                                                    {user.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                          })
                                                        : "—"}
                                                </td>

                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#5f6368" }}
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm text-white px-3"
                                                            style={{ backgroundColor: "#ca5c5c" }}
                                                            onClick={() => setDeleteTarget(user)}
                                                            disabled={deletingId === id}
                                                        >
                                                            {deletingId === id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <ConfirmModal
                show={!!deleteTarget}
                title="Delete user"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong>
                            {deleteTarget?.first_name} {deleteTarget?.last_name}
                        </strong>
                        ? This cannot be undone.
                    </>
                }
                confirmText="Delete"
                loading={deletingId !== null}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}