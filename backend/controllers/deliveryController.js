import mongoose from "mongoose";
import Delivery from "../models/Delivery.js";
import User from "../models/User.js";

// Normalize roles such as "Guard" and "guard"
const getRole = (req) =>
    String(req.user?.role || "").toLowerCase();

// Find the authenticated user in MongoDB
const getAuthenticatedUser = async (req) => {
    const userId = req.user?.id || req.user?._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
        return null;
    }

    return User.findById(userId).select(
        "first_name last_name email role unit_number"
    );
};

// GET /api/deliveries
// Guard: see all deliveries
// Resident: see only deliveries for their own unit
export const getDeliveries = async (req, res) => {
    try {
        const role = getRole(req);

        if (!["guard", "resident"].includes(role)) {
            return res.status(403).json({
                message: "You are not authorized to view deliveries.",
            });
        }

        if (role === "guard") {
            const deliveries = await Delivery.find().sort({
                logged_at: -1,
            });

            return res.status(200).json(deliveries);
        }

        // Resident: get the unit from their database account
        const resident = await getAuthenticatedUser(req);

        if (!resident) {
            return res.status(401).json({
                message: "User not found. Please log in again.",
            });
        }

        if (String(resident.role).toLowerCase() !== "resident") {
            return res.status(403).json({
                message: "Resident access is required.",
            });
        }

        if (!resident.unit_number?.trim()) {
            return res.status(400).json({
                message:
                    "Your account does not have a unit number. Contact your building administrator.",
            });
        }

        const deliveries = await Delivery.find({
            resident_unit: resident.unit_number.trim(),
        }).sort({
            logged_at: -1,
        });

        return res.status(200).json(deliveries);
    } catch (error) {
        console.error("Get deliveries error:", error);

        return res.status(500).json({
            message: "Failed to fetch deliveries.",
        });
    }
};

// GET /api/deliveries/:id
// Guard: can view any delivery
// Resident: can view a delivery only if it belongs to their unit
export const getDeliveryById = async (req, res) => {
    try {
        const role = getRole(req);

        if (!["guard", "resident"].includes(role)) {
            return res.status(403).json({
                message: "You are not authorized to view deliveries.",
            });
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
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

        if (role === "resident") {
            const resident = await getAuthenticatedUser(req);

            if (!resident) {
                return res.status(401).json({
                    message: "User not found. Please log in again.",
                });
            }

            if (String(resident.role).toLowerCase() !== "resident") {
                return res.status(403).json({
                    message: "Resident access is required.",
                });
            }

            if (
                !resident.unit_number?.trim() ||
                delivery.resident_unit !== resident.unit_number.trim()
            ) {
                return res.status(403).json({
                    message:
                        "You can only view deliveries for your own unit.",
                });
            }
        }

        return res.status(200).json(delivery);
    } catch (error) {
        console.error("Get delivery by ID error:", error);

        return res.status(500).json({
            message: "Failed to fetch delivery.",
        });
    }
};

// POST /api/deliveries
// Guard only
export const createDelivery = async (req, res) => {
    try {
        if (getRole(req) !== "guard") {
            return res.status(403).json({
                message: "Only guards can record deliveries.",
            });
        }

        const {
            resident_unit,
            delivery_type,
            courier_name,
            pickup_location,
        } = req.body;

        if (
            typeof resident_unit !== "string" ||
            !resident_unit.trim() ||
            typeof courier_name !== "string" ||
            !courier_name.trim() ||
            !delivery_type ||
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

        const allowedPickupLocations = [
            "Security Desk",
            "Locker",
        ];

        if (!allowedDeliveryTypes.includes(delivery_type)) {
            return res.status(400).json({
                message: "Invalid delivery type.",
            });
        }

        if (!allowedPickupLocations.includes(pickup_location)) {
            return res.status(400).json({
                message: "Invalid pickup location.",
            });
        }

        const guard = await getAuthenticatedUser(req);

        if (!guard) {
            return res.status(401).json({
                message: "User not found. Please log in again.",
            });
        }

        if (String(guard.role).toLowerCase() !== "guard") {
            return res.status(403).json({
                message: "Only guards can record deliveries.",
            });
        }

        const guardName =
            `${guard.first_name || ""} ${guard.last_name || ""}`.trim();

        if (!guardName) {
            return res.status(400).json({
                message: "Your guard account is missing a name.",
            });
        }

        const delivery = await Delivery.create({
            resident_unit: resident_unit.trim(),
            delivery_type,
            courier_name: courier_name.trim(),
            pickup_location,
            guard_name: guardName,
            // logged_at is assigned automatically by the model
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

// PUT /api/deliveries/:id
// Guard only
export const updateDelivery = async (req, res) => {
    try {
        if (getRole(req) !== "guard") {
            return res.status(403).json({
                message: "Only guards can update deliveries.",
            });
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
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

        const allowedDeliveryTypes = [
            "Package / Parcel",
            "Food Delivery",
            "Courier Service",
        ];

        const allowedPickupLocations = [
            "Security Desk",
            "Locker",
        ];

        if (
            typeof resident_unit !== "string" ||
            !resident_unit.trim() ||
            typeof courier_name !== "string" ||
            !courier_name.trim() ||
            !allowedDeliveryTypes.includes(delivery_type) ||
            !allowedPickupLocations.includes(pickup_location)
        ) {
            return res.status(400).json({
                message: "Please provide valid delivery information.",
            });
        }

        const delivery = await Delivery.findByIdAndUpdate(
            id,
            {
                resident_unit: resident_unit.trim(),
                delivery_type,
                courier_name: courier_name.trim(),
                pickup_location,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!delivery) {
            return res.status(404).json({
                message: "Delivery not found.",
            });
        }

        // Keep the original guard name and logged time
        return res.status(200).json({
            message: "Delivery updated successfully.",
            delivery,
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

// DELETE /api/deliveries/:id
// Guard only
export const deleteDelivery = async (req, res) => {
    try {
        if (getRole(req) !== "guard") {
            return res.status(403).json({
                message: "Only guards can delete deliveries.",
            });
        }

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid delivery ID.",
            });
        }

        const delivery = await Delivery.findByIdAndDelete(id);

        if (!delivery) {
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
