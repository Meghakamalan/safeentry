import React, {useState,useEffect} from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
    first_name: "",
    last_name: "",
    expected_date: "",
    expected_time: "",
    vehicle_info: "",
  };
  const Visitors = () => {
    const [visitors, setVisitors] = useState([]);
    const[showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    // Fetch visitors list from  API on  mount
    const fetchVisitors = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/visitors`, { withCredentials: true, });
            setVisitors(response.data);
        } catch (error) {
            console.error("Error fetching visitors:", error);
            // setError("Failed to fetch visitors. Please try again.");
        }
    };

    useEffect(() => {
      fetchVisitors();
    }, []);

    // form input handler
    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // open form for creating new visitor
    const handleAddNew = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(true);
    };

//submit handler
const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        // create new visitor
        await axios.post(`${API_URL}/api/visitors`, formData, { withCredentials: true });
    
    await fetchVisitors(); // Refresh the list after adding
    setShowForm(false);
    setFormData(initialForm);
    }catch (error) {
        console.error("Error creating visitor:", error);
        setError("Failed to create visitor. Please try again.");
    } finally {
        setLoading(false);
    }
   };

return (
    <div className="container-fluid py-2">
      {/* Header bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-secondary" style={{ color: "#1f3a52" }}>
          {showForm ? (editingId ? "Edit Visitor" : "Register New Visitor") : "Visitors"}
        </h1>

        {!showForm && (
          <button
            onClick={handleAddNew}
            className="btn text-white px-4 py-2"
            style={{ backgroundColor: "#4155c7ff", borderRadius: "4px" }}
          >
            + Add a visitor
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Conditionally Render Form OR Visitors Table */}
      {showForm ? (
        <div className="d-flex justify-content-center mt-3">
          <div className="w-100" style={{ maxWidth: "600px" }}>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Expected Date</label>
                  <input
                    type="text"
                    name="expected_date"
                    className="form-control"
                    placeholder="e.g. 28-Oct-2026"
                    value={formData.expected_date}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Expected Time</label>
                  <input
                    type="text"
                    name="expected_time"
                    className="form-control"
                    placeholder="e.g. 10:00 AM"
                    value={formData.expected_time}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Vehicle Info</label>
                  <textarea
                    name="vehicle_info"
                    className="form-control"
                    rows="3"
                    placeholder="e.g. CJCX 389 Ford F-Series truck"
                    value={formData.vehicle_info}
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
                  style={{ backgroundColor: "#695e59" }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
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
        /* Visitors Data Table View */
        <div className="table-responsive">
          <table className="table align-middle text-center">
            <thead style={{ backgroundColor: "#ede6e2" }}>
              <tr>
                <th scope="col" className="py-3">Visitor Name</th>
                <th scope="col" className="py-3">Date</th>
                <th scope="col" className="py-3">Time</th>
                <th scope="col" className="py-3">Vehicle Info</th>
                <th scope="col" className="py-3">Status</th>
                <th scope="col" className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-muted">
                    No visitors registered yet. Click "+ Add a visitor" to add one.
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>{`${visitor.first_name} ${visitor.last_name}`}</td>
                    <td>{visitor.expected_date}</td>
                    <td>{visitor.expected_time}</td>
                    <td style={{ whiteSpace: "pre-line" }}>{visitor.vehicle_info}</td>
                    <td>
                      <span className={`badge px-3 py-2 rounded-pill ${getStatusBadge(visitor.status)}`}>
                        {visitor.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm text-white px-3"
                          style={{ backgroundColor: "#5f6368" }}
                        //   onClick={() => handleEdit(visitor)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm text-white px-3"
                          style={{ backgroundColor: "#ca5c5c" }}
                        //   onClick={() => handleDelete(visitor._id)}
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

export default Visitors;
