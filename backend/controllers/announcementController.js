import Announcement from "../models/Announcement.js";

// Get the logged-in user's role.
const getUserRole = (req) =>
    String(req.user?.role || "").toLowerCase();

// GET: Fetch announcements.
export const getAnnouncements = async (req, res) => {
    try {
        const userRole = getUserRole(req);

        if (!req.user?.id && !req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (!["admin", "resident", "guard"].includes(userRole)) {
            return res.status(403).json({
                message: "You are not authorized to view announcements",
            });
        }

        const announcements = await Announcement.find().sort({
            createdAt: -1,
        });

        return res.status(200).json(announcements);
    } catch (error) {
        console.error("Get Announcements Error:", error);

        return res.status(500).json({
            message: error.message || "Error fetching announcements",
        });
    }
};

// POST: Create an announcement (Admin only).
export const createAnnouncement = async (req, res) => {
    try {
        const userRole = getUserRole(req);

        if (!req.user?.id && !req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "admin") {
            return res.status(403).json({
                message: "Only admins can create announcements",
            });
        }

        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required",
            });
        }

        const announcement = await Announcement.create({
            title: title.trim(),
            content: content.trim(),
        });

        return res.status(201).json({
            message: "Announcement created successfully",
            announcement,
        });
    } catch (error) {
        console.error("Create Announcement Error:", error);

        return res.status(500).json({
            message: error.message || "Error creating announcement",
        });
    }
};

// PUT: Update an announcement (Admin only).
export const updateAnnouncement = async (req, res) => {
    try {
        const userRole = getUserRole(req);

        if (!req.user?.id && !req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "admin") {
            return res.status(403).json({
                message: "Only admins can update announcements",
            });
        }

        const { id } = req.params;
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required",
            });
        }

        const announcement = await Announcement.findByIdAndUpdate(
            id,
            {
                title: title.trim(),
                content: content.trim(),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found",
            });
        }

        return res.status(200).json({
            message: "Announcement updated successfully",
            announcement,
        });
    } catch (error) {
        console.error("Update Announcement Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid announcement ID",
            });
        }

        return res.status(500).json({
            message: error.message || "Error updating announcement",
        });
    }
};

// DELETE: Delete an announcement (Admin only).
export const deleteAnnouncement = async (req, res) => {
    try {
        const userRole = getUserRole(req);

        if (!req.user?.id && !req.user?._id) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (userRole !== "admin") {
            return res.status(403).json({
                message: "Only admins can delete announcements",
            });
        }

        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found",
            });
        }

        return res.status(200).json({
            message: "Announcement deleted successfully",
        });
    } catch (error) {
        console.error("Delete Announcement Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid announcement ID",
            });
        }

        return res.status(500).json({
            message: error.message || "Error deleting announcement",
        });
    }
};
