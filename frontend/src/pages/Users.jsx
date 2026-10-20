import { useEffect, useState } from "react";
import axios from "axios";
import { getUserRole } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL || "";
import ConfirmModal from '../componets/ConfirmModel';

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

        // Save this before resetForm clears editingId
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

            // Reload the list after a successful operation
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

    // Only admins can manage users
    if (!isAdmin) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    You do not have permission to access this page.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            {/* Page heading */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        User Management
                    </h2>
                    <p className="text-muted mb-0">
                        Manage SafeEntry residents, guards, and admins.
                    </p>
                </div>

                {!showForm && (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddUser}
                    >
                        <i className="bi bi-person-plus me-2"></i>
                        Add User
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
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">
                            {editingId ? "Edit User" : "Create User"}
                        </h5>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                {/* First name */}
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="first_name"
                                        className="form-label"
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
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="last_name"
                                        className="form-label"
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
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
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
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="phone"
                                        className="form-label"
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
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="unit_number"
                                        className="form-label"
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
                                    <div className="col-md-6 mb-3">
                                        <label
                                            htmlFor="password"
                                            className="form-label"
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
                                        <div className="form-text">
                                            Password must be at least 8 characters.
                                        </div>
                                    </div>
                                )}

                                {/* Role */}
                                <div className="col-md-6 mb-4">
                                    <label
                                        htmlFor="role"
                                        className="form-label"
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
                                        <option value="Resident">
                                            Resident
                                        </option>
                                        <option value="Guard">
                                            Guard
                                        </option>
                                        <option value="Admin">
                                            Admin
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Form actions */}
                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                          ? "Update User"
                                          : "Create User"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
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
                /* Users list */
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold">
                            All Users ({users.length})
                        </h5>
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
                                    Loading users...
                                </p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-people display-4 text-muted"></i>
                                <p className="text-muted mt-3 mb-0">
                                    No users found.
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Unit</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th className="text-end">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => {
                                            const id = user._id || user.id;

                                            return (
                                                <tr key={id}>
                                                    <td className="fw-semibold">
                                                        {user.first_name}{" "}
                                                        {user.last_name}
                                                    </td>

                                                    <td>{user.email}</td>

                                                    <td>
                                                        {user.phone || "—"}
                                                    </td>

                                                    <td>
                                                        {user.unit_number || "—"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                String(user.role).toLowerCase() ===
                                                                "admin"
                                                                    ? "text-bg-danger"
                                                                    : String(user.role).toLowerCase() ===
                                                                        "guard"
                                                                      ? "text-bg-warning"
                                                                      : "text-bg-primary"
                                                            }`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {user.createdAt
                                                            ? new Date(
                                                                  user.createdAt
                                                              ).toLocaleDateString()
                                                            : "—"}
                                                    </td>

                                                    <td className="text-end text-nowrap">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                            onClick={() =>
                                                                handleEdit(user)
                                                            }
                                                            title="Edit user"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                            <span className="ms-1">
                                                                Edit
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => setDeleteTarget(user)}
                                                            disabled={
                                                                deletingId === id
                                                            }
                                                            title="Delete user"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                            <span className="ms-1">
                                                                {deletingId === id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
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