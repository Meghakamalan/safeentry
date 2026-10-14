
import express from "express";

import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcementController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Fetch announcements.
router.get("/", authenticateUser, getAnnouncements);

// POST: Create an announcement (Admin only).
router.post("/", authenticateUser, createAnnouncement);

// PUT: Update an announcement (Admin only).
router.put("/:id", authenticateUser, updateAnnouncement);

// DELETE: Delete an announcement (Admin only).
router.delete("/:id", authenticateUser, deleteAnnouncement);

export default router;
