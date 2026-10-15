import mongoose from "mongoose";
import Delivery from "../models/Delivery.js";

// Check whether the logged-in user is an admin or guard
const isGuardOrAdmin = (req) => {
    const role = String(req.user?.role || "").toLowerCase();

    return role === "guard" || role === "admin";
};

// Get all deliveries
export const getDeliveries = async (req, res) => {
    try {
        if (!isGuardOrAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Guards and admins only.",
            });
        }

        const deliveries = await Delivery.find()
            .sort({ logged_at: -1 });

        return res.status(200).json(deliveries);
    } catch (error) {
        console.error("Get deliveries error:", error);

        return res.status(500).json({
            message: "Failed to fetch deliveries.",
        });
    }
};

// Get one delivery by ID
export const getDeliveryById = async (req, res) => {
    try {
        if (!isGuardOrAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Guards and admins only.",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid delivery ID.",
            });
        }

        const delivery = await Delivery.findById(id);

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found.",
            });
        }

        return res.status(200).json(delivery);
    } catch (error) {
        console.error("Get delivery error:", error);

        return res.status(500).json({
            message: "Failed to fetch delivery.",
        });
    }
};

// Create a delivery
export const createDelivery = async (req, res) => {
    try {
        if (!isGuardOrAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Guards and admins only.",
            });
        }

        const {
            resident_unit,
            delivery_type,
            courier_name,
            pickup_location,
        } = req.body;

        // Validate required fields
        if (
            !resident_unit?.trim() ||
            !delivery_type ||
            !courier_name?.trim() ||
            !pickup_location
        ) {
            return res.status(400).json({
                message:
                    "Resident unit, delivery type, courier name, and pickup location are required.",
            });
        }

        // Validate delivery type
        const allowedDeliveryTypes = [
            "Package / Parcel",
            "Food Delivery",
            "Courier Service",
        ];

        if (!allowedDeliveryTypes.includes(delivery_type)) {
            return res.status(400).json({
                message: "Invalid delivery type.",
            });
        }

        // Validate pickup location
        const allowedPickupLocations = [
            "Security Desk",
            "Locker",
        ];

        if (!allowedPickupLocations.includes(pickup_location)) {
            return res.status(400).json({
                message: "Invalid pickup location.",
            });
        }

        // Get guard name from the authenticated user's account
        const guardName = [
            req.user?.first_name,
            req.user?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (!guardName) {
            return res.status(400).json({
                message:
                    "Unable to identify the logged-in guard. Check the authentication middleware.",
            });
        }

        const delivery = await Delivery.create({
            resident_unit: resident_unit.trim(),
            delivery_type,
            courier_name: courier_name.trim(),
            guard_name: guardName,
            pickup_location,
            // logged_at is set automatically by the model
        });

        return res.status(201).json({
            message: "Delivery recorded successfully.",
            delivery,
        });
    } catch (error) {
        console.error("Create delivery error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to record delivery.",
        });
    }
};

// Update a delivery
export const updateDelivery = async (req, res) => {
    try {
        if (!isGuardOrAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Guards and admins only.",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid delivery ID.",
            });
        }

        const {
            resident_unit,
            delivery_type,
            courier_name,
            pickup_location,
        } = req.body;

        // Validate required fields
        if (
            !resident_unit?.trim() ||
            !delivery_type ||
            !courier_name?.trim() ||
            !pickup_location
        ) {
            return res.status(400).json({
                message:
                    "Resident unit, delivery type, courier name, and pickup location are required.",
            });
        }

        const allowedDeliveryTypes = [
            "Package / Parcel",
            "Food Delivery",
            "Courier Service",
        ];

        if (!allowedDeliveryTypes.includes(delivery_type)) {
            return res.status(400).json({
                message: "Invalid delivery type.",
            });
        }

        const allowedPickupLocations = [
            "Security Desk",
            "Locker",
        ];

        if (!allowedPickupLocations.includes(pickup_location)) {
            return res.status(400).json({
                message: "Invalid pickup location.",
            });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            id,
            {
                resident_unit: resident_unit.trim(),
                delivery_type,
                courier_name: courier_name.trim(),
                pickup_location,
                // Keep original guard_name and logged_at unchanged
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedDelivery) {
            return res.status(404).json({
                message: "Delivery not found.",
            });
        }

        return res.status(200).json({
            message: "Delivery updated successfully.",
            delivery: updatedDelivery,
        });
    } catch (error) {
        console.error("Update delivery error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to update delivery.",
        });
    }
};

// Delete a delivery
export const deleteDelivery = async (req, res) => {
    try {
        if (!isGuardOrAdmin(req)) {
            return res.status(403).json({
                message: "Access denied. Guards and admins only.",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid delivery ID.",
            });
        }

        const deletedDelivery = await Delivery.findByIdAndDelete(id);

        if (!deletedDelivery) {
            return res.status(404).json({
                message: "Delivery not found.",
            });
        }

        return res.status(200).json({
            message: "Delivery deleted successfully.",
        });
    } catch (error) {
        console.error("Delete delivery error:", error);

        return res.status(500).json({
            message: "Failed to delete delivery.",
        });
    }
};
