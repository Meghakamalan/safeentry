
import express from "express";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/userController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, getUsers);
router.post("/", authenticateUser, createUser);
router.put("/:id", authenticateUser, updateUser);
router.delete("/:id", authenticateUser, deleteUser);

export default router;
