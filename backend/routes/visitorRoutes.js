import express from "express";
import { getVisitor, createVisitor, updateVisitor, deleteVisitor } from "../controllers/visitorController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
const router = express.Router();
//all routes require authenicated user middleware
router.get("/", authenticateUser, getVisitor);
router.post("/", authenticateUser, createVisitor);
router.put("/:id", authenticateUser, updateVisitor);
router.delete("/:id", authenticateUser, deleteVisitor);

export default router;