import express from "express";
import {
    getDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery,
} from "../controllers/deliveryController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, getDeliveries);
router.get("/:id", authenticateUser, getDeliveryById);
router.post("/", authenticateUser, createDelivery);
router.put("/:id", authenticateUser, updateDelivery);
router.delete("/:id", authenticateUser, deleteDelivery);

export default router;
