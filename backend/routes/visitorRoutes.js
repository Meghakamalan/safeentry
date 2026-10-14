import express from "express";
import { getVisitors, createVisitor, updateVisitor, deleteVisitor,getAllVisitors } from "../controllers/visitorController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
const router = express.Router();
//all routes require authenicated user middleware
router.get("/", authenticateUser, getVisitors);
router.get("/AllVisitors", authenticateUser,getAllVisitors);
router.post("/", authenticateUser, createVisitor);
router.put("/:id", authenticateUser, updateVisitor);
router.delete("/:id", authenticateUser, deleteVisitor);


export default router;