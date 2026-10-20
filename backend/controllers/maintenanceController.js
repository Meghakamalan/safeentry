import Maintenance from "../models/Maintenance.js";

// Get the logged-in user's ID and role.
const getUserId = (req) => req.user?.id || req.user?._id;

const getUserRole = (req) =>
    String(req.user?.role || "").toLowerCase();

// Allowed statuses for maintenance requests.
const allowedStatuses = ["Submitted", "Review", "Assign", "Resolved"];

// GET: Fetch maintenance requests based on the user's role.
export const getMaintenanceRequest = async (req, res) => {
    try {
        const residentId = getUserId(req);
        const userRole = getUserRole(req);

        if (!residentId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        let requests;

        if (userRole === "resident") {
            // Residents can only see their own requests.
            requests = await Maintenance.find({
                resident_id: residentId,
            }).sort({ createdAt: -1 });
        } else if (userRole === "admin" || userRole === "guard") {
            // Admins and Guards can see all requests.
            requests = await Maintenance.find().sort({
                createdAt: -1,
            });
        } else {
            return res.status(403).json({
                message: "You are not authorized to view maintenance requests",
            });
        }

        return res.status(200).json(requests);
    } catch (error) {
        console.error("Get Maintenance Error:", error);

        return res.status(500).json({
            message:
                error.message || "Error fetching maintenance requests",
        });
    }
};

// GET: Fetch all maintenance requests (Admin only).
export const getAllMaintenanceRequests = async (req, res) => {
    try {
        const userRole = getUserRole(req);

        if (userRole !== "admin") {
            return res.status(403).json({
                message: "Only admins can access all maintenance requests",
            });
        }

        console.log("Database:", Maintenance.db.name);
        console.log("Collection:", Maintenance.collection.name);

        const requests = await Maintenance.find().sort({
            createdAt: -1,
        });

        return res.status(200).json(requests);
    } catch (error) {
        console.error("Get All Maintenance Error:", error);

        return res.status(500).json({
            message:
                error.message || "Error fetching all maintenance requests",
        });
    }
};

// POST: Create a new maintenance request (Resident only).
export const createMaintenanceRequest = async (req, res) => {
    try {
        const residentId = getUserId(req);
        const userRole = getUserRole(req);

        if (!residentId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "resident") {
            return res.status(403).json({
                message: "Only residents can create maintenance requests",
            });
        }

        const { issue_type, description, request_date } = req.body;

        if (!issue_type || !description) {
            return res.status(400).json({
                message: "Issue type and description are required",
            });
        }

        const newTicket = await Maintenance.create({
            resident_id: residentId,
            issue_type,
            description,
            request_date: request_date
                ? new Date(request_date)
                : new Date(),
            status: "Submitted",
        });

        return res.status(201).json({
            message: "Maintenance request created successfully",
            request: newTicket,
        });
    } catch (error) {
        console.error("Create Maintenance Error:", error);

        return res.status(500).json({
            message:
                error.message || "Error creating maintenance request",
        });
    }
};

// PUT: Update a maintenance request.
export const updateMaintenanceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const userRole = getUserRole(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "resident" && userRole !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to update maintenance requests",
            });
        }

        const {
            issue_type,
            description,
            request_date,
            status,
        } = req.body;

        // Residents can update only their own requests.
        // Admins can update any request.
        const ticketQuery =
            userRole === "admin"
                ? { _id: id }
                : { _id: id, resident_id: userId };

        const ticket = await Maintenance.findOne(ticketQuery);

        if (!ticket) {
            return res.status(404).json({
                message: "Maintenance request not found",
            });
        }

        // Update ordinary request fields when provided.
        if (issue_type !== undefined) {
            ticket.issue_type = issue_type;
        }

        if (description !== undefined) {
            ticket.description = description;
        }

        if (request_date !== undefined) {
            const parsedDate = new Date(request_date);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid request date",
                });
            }

            ticket.request_date = parsedDate;
        }

        // Only Admins can change the request status.
        if (status !== undefined) {
            if (userRole !== "admin") {
                return res.status(403).json({
                    message: "Only admins can update maintenance status",
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid maintenance status",
                    allowedStatuses,
                });
            }

            ticket.status = status;
        }

        await ticket.save();

        return res.status(200).json({
            message: "Maintenance request updated successfully",
            request: ticket,
        });
    } catch (error) {
        console.error("Update Maintenance Error:", error);

        return res.status(500).json({
            message:
                error.message || "Error updating maintenance request",
        });
    }
};

// DELETE: Delete a maintenance request.
export const deleteMaintenanceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const userRole = getUserRole(req);

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "resident" && userRole !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to delete maintenance requests",
            });
        }

        // Residents can delete only their own requests.
        // Admins can delete any request.
        const ticketQuery =
            userRole === "admin"
                ? { _id: id }
                : { _id: id, resident_id: userId };

        const deletedTicket = await Maintenance.findOneAndDelete(
            ticketQuery
        );

        if (!deletedTicket) {
            return res.status(404).json({
                message: "Maintenance request not found",
            });
        }

        return res.status(200).json({
            message: "Maintenance request deleted successfully",
        });
    } catch (error) {
        console.error("Delete Maintenance Error:", error);

        return res.status(500).json({
            message:
                error.message || "Error deleting maintenance request",
        });
    }
};