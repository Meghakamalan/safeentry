import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
    issue_type: "Door Latch Problem", // Default issue type
    description: "",
    request_date: new Date().toISOString().split("T")[0], // Default to today's date
  };

  const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //fetch tickets on componet load
    const fetchMaintenance = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/maintenance`, { withCredentials: true });
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching maintenance requests:", error);
            // setError("Failed to fetch maintenance requests. Please try again later.");
            if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      }
        }
    };

    useEffect(() => {
        fetchMaintenance();
    }, []);
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    //open form for creating new ticket
    const handleAddNew = () => {
        setFormData(initialForm);//reset form data to initial values
        setEditingId(null);
        setShowForm(true);
    };
        
    //edit existing ticket
    const handleEdit = (ticket) => {
        const formattedDate = ticket.request_date ? new Date(ticket.request_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        setFormData({
            issue_type: ticket.issue_type,
            description: ticket.description,
            request_date: formattedDate,
        });
        setEditingId(ticket._id);
        setShowForm(true);
    };

    //delete existing ticket
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this maintenance request?")) return;
        try {
            await axios.delete(`${API_URL}/api/maintenance/${id}`, { withCredentials: true });
           setRequests(requests.filter((ticket) => ticket._id !== id));
        } catch (error) {
            console.error("Failed to delete maintenance request:", error);
            // setError("Failed to delete maintenance request. Please try again.");
            alert("Failed to delete maintenance request. Please try again.");
        }
    };

    //submit form data to backend
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    try{
        if (editingId) {
            // Update existing ticket
            await axios.put(`${API_URL}/api/maintenance/${editingId}`, formData, { withCredentials: true });
        } else {
            // Create new ticket
            await axios.post(`${API_URL}/api/maintenance`, formData, { withCredentials: true });
        }
        await fetchMaintenance();
        setShowForm(false);
        setFormData(initialForm);
        setEditingId(null);
    } catch (err) {
      console.error("Error submitting maintenance form:", err);
      setError(
        err.response?.data?.message || "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
    // Helper function to format Date object into "DD-MMM-YYYY" display format
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "resolved") return "bg-success text-white";
    if (s === "in progress") return "bg-primary text-white";
    if (s === "closed") return "bg-secondary text-white";
    return "bg-warning text-dark"; // Default Submitted status badge
  };

    return (
    <div className="container-fluid py-2">
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold" style={{ color: "#1f3a52" }}>
          {showForm ? (editingId ? "Edit Maintenance Request" : "New Maintenance Request") : "Maintenance"}
        </h1>

        {!showForm && (
          <button
            onClick={handleAddNew}
            className="btn text-white px-4 py-2"
            style={{ backgroundColor: "#2b63d9", borderRadius: "6px" }}
          >
            + New Request
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Conditionally Render Form OR Table */}
      {showForm ? (
        <div className="d-flex justify-content-center mt-3">
          <div className="w-100" style={{ maxWidth: "600px" }}>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Issue Type</label>
                  <select
                    name="issue_type"
                    className="form-select"
                    value={formData.issue_type}
                    onChange={onChange}
                    required
                  >
                    <option value="Door Latch Problem">Door Latch Problem</option>
                    <option value="Leaking Sink">Leaking Sink</option>
                    <option value="Air Conditioning Unit Failure">Air Conditioning Unit Failure</option>
                    <option value="Light Replacement">Light Replacement</option>
                    <option value="Thermometer Replacement">Thermometer Replacement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Date</label>
                  <input
                    type="date"
                    name="request_date"
                    className="form-control"
                    value={formData.request_date}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
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

              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-4">
                <button
                  type="submit"
                  className="btn text-white flex-grow-1"
                  style={{ backgroundColor: "#5f6368" }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : editingId ? "Update Ticket" : "Submit Ticket"}
                </button>
                <button
                  type="button"
                  className="btn text-white flex-grow-1"
                  style={{ backgroundColor: "#ca5c5c" }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead style={{ backgroundColor: "#f0f4f8" }}>
              <tr>
                <th scope="col" className="py-3">Issue</th>
                <th scope="col" className="py-3">Date</th>
                <th scope="col" className="py-3">Status</th>
                <th scope="col" className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-muted">
                    No maintenance requests submitted yet. Click "+ New Request" to create one.
                  </td>
                </tr>
              ) : (
                requests.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.issue_type}</td>
                    <td>{formatDateDisplay(ticket.request_date)}</td>
                    <td>
                      <span className={`badge px-3 py-2 rounded-pill ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm text-white px-3"
                          style={{ backgroundColor: "#5f6368" }}
                          onClick={() => handleEdit(ticket)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm text-white px-3"
                          style={{ backgroundColor: "#ca5c5c" }}
                          onClick={() => handleDelete(ticket._id)}
                        >
                          Delete
                        </button>
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