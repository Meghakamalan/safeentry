import express from "express";
import { getVisitors, createVisitor, updateVisitor,updateVisitorStatus, deleteVisitor,getAllVisitors } from "../controllers/visitorController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
const router = express.Router();
// fetch all visitors registered by the logged-in resident
router.get("/", authenticateUser, getVisitors);
// fetch all visitors registered by the logged-in admin
router.get("/AllVisitors", authenticateUser,getAllVisitors);
// PATCH Update the status of an existing visitor
router.patch("/:id/status", authenticateUser, updateVisitorStatus);
// POST Create a new visitor
router.post("/", authenticateUser, createVisitor);
// PUT Update an existing visitor
router.put("/:id", authenticateUser, updateVisitor);
// DELETE Delete a visitor
router.delete("/:id", authenticateUser, deleteVisitor);
// PATCH Update the status of an existing visitor
router.patch("/:id/status", authenticateUser, updateVisitorStatus);


export default router;