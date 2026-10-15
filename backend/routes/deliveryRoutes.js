import express from "express";

import {
    getDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery,
} from "../controllers/deliveryController.js";

import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all deliveries
router.get("/", authenticateUser, getDeliveries);

// Get one delivery by ID
router.get("/:id", authenticateUser, getDeliveryById);

// Create a new delivery
router.post("/", authenticateUser, createDelivery);

// Update a delivery
router.put("/:id", authenticateUser, updateDelivery);

// Delete a delivery
router.delete("/:id", authenticateUser, deleteDelivery);

export default router;
