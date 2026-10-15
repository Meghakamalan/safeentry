
import Visitor from "../models/Visitor.js";
import User from "../models/User.js";

// GET: Fetch visitors
export const getVisitors = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    let visitors;

    if (role === "resident") {
      visitors = await Visitor.find({
        resident_id: userId,
      }).sort({ createdAt: -1 });
    } else if (role === "admin" || role === "guard") {
      visitors = await Visitor.find().sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Support older visitor records without unit_number.
    const results = await Promise.all(
      visitors.map(async (visitor) => {
        const item = visitor.toObject();

        if (!item.unit_number && item.resident_id) {
          const resident = await User.findById(item.resident_id)
            .select("unit unit_number")
            .lean();

          item.unit_number = String(
            resident?.unit ??
            resident?.unit_number ??
            ""
          ).trim();
        }

        return item;
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("Get Visitors Error:", error);

    return res.status(500).json({
      message: "Error fetching visitors",
    });
  }
};

// GET: Fetch all visitors for Admin
export const getAllVisitors = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    const visitors = await Visitor.find().sort({ createdAt: -1 });

    const results = await Promise.all(
      visitors.map(async (visitor) => {
        const item = visitor.toObject();

        if (!item.unit_number && item.resident_id) {
          const resident = await User.findById(item.resident_id)
            .select("unit unit_number")
            .lean();

          item.unit_number = String(
            resident?.unit ??
            resident?.unit_number ??
            ""
          ).trim();
        }

        return item;
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("Get All Visitors Error:", error);

    return res.status(500).json({
      message: "Error fetching all visitors",
    });
  }
};

// POST: Create a visitor
export const createVisitor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = String(req.user?.role || "").toLowerCase();

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!["resident", "guard", "admin"].includes(role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const {
      first_name,
      last_name,
      expected_date,
      expected_time,
      vehicle_info,
    } = req.body;

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !expected_date ||
      !expected_time
    ) {
      return res.status(400).json({
        message:
          "First name, last name, expected date, and expected time are required",
      });
    }

    let residentId;
    let unitNumber;

    if (role === "resident") {
      // Always use the authenticated resident's database record.
      const resident = await User.findById(userId)
        .select("unit unit_number");

      if (!resident) {
        return res.status(404).json({
          message: "Resident account not found",
        });
      }

      // Support either field name in the User schema.
      const assignedUnit =
        resident.unit ?? resident.unit_number;

      if (
        assignedUnit === undefined ||
        assignedUnit === null ||
        String(assignedUnit).trim() === ""
      ) {
        console.error("Resident has no unit assigned:", {
          userId: String(userId),
          unit: resident.unit,
          unit_number: resident.unit_number,
        });

        return res.status(400).json({
          message:
            "Your account does not have a unit number assigned",
        });
      }

      residentId = resident._id;
      unitNumber = String(assignedUnit).trim();
    } else {
      // Guards/Admins must identify the resident account.
      residentId = req.body.resident_id;
      unitNumber = String(req.body.unit_number || "").trim();

      if (!residentId) {
        return res.status(400).json({
          message: "resident_id is required",
        });
      }

      if (!unitNumber) {
        return res.status(400).json({
          message: "Unit number is required",
        });
      }

      const resident = await User.findById(residentId);

      if (!resident) {
        return res.status(404).json({
          message: "Resident account not found",
        });
      }
    }

    const parsedDate = new Date(expected_date);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expected date",
      });
    }

    const newVisitor = new Visitor({
      resident_id: residentId,
      unit_number: unitNumber,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      expected_date: parsedDate,
      expected_time,
      vehicle_info: vehicle_info?.trim() || "",
      status: "Pending",
    });

    await newVisitor.save();

    return res.status(201).json({
      message: "Visitor created successfully",
      visitor: newVisitor,
    });
  } catch (error) {
    console.error("Create Visitor Error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error creating visitor",
    });
  }
};

// PUT: Update a visitor
export const updateVisitor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = String(req.user?.role || "").toLowerCase();
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!["resident", "admin"].includes(role)) {
      return res.status(403).json({
        message: "You do not have permission to update visitors",
      });
    }

    const {
      first_name,
      last_name,
      expected_date,
      expected_time,
      vehicle_info,
    } = req.body;

    const filter =
      role === "admin"
        ? { _id: id }
        : { _id: id, resident_id: userId };

    const visitor = await Visitor.findOne(filter);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor record not found",
      });
    }

    if (first_name !== undefined) {
      visitor.first_name = first_name.trim();
    }

    if (last_name !== undefined) {
      visitor.last_name = last_name.trim();
    }

    if (expected_date !== undefined) {
      const parsedDate = new Date(expected_date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid expected date",
        });
      }

      visitor.expected_date = parsedDate;
    }

    if (expected_time !== undefined) {
      visitor.expected_time = expected_time;
    }

    if (vehicle_info !== undefined) {
      visitor.vehicle_info = vehicle_info.trim();
    }

    // Residents cannot change their assigned unit.
    if (role === "resident") {
      const resident = await User.findById(userId)
        .select("unit unit_number");

      if (!resident) {
        return res.status(404).json({
          message: "Resident account not found",
        });
      }

      const assignedUnit =
        resident.unit ?? resident.unit_number;

      if (
        assignedUnit === undefined ||
        assignedUnit === null ||
        String(assignedUnit).trim() === ""
      ) {
        return res.status(400).json({
          message: "Resident unit number not found",
        });
      }

      visitor.unit_number = String(assignedUnit).trim();
    }

    await visitor.save();

    return res.status(200).json({
      message: "Visitor updated successfully",
      visitor,
    });
  } catch (error) {
    console.error("Update Visitor Error:", error);

    if (
      error.name === "CastError" ||
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Error updating visitor",
    });
  }
};

// PATCH: Update visitor status (Guard/Admin)
export const updateVisitorStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = String(req.user?.role || "").toLowerCase();
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!["guard", "admin"].includes(role)) {
      return res.status(403).json({
        message:
          "Only Guards and Admins can update visitor status",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Checked-In",
      "Checked-Out",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid visitor status",
      });
    }

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor record not found",
      });
    }

    visitor.status = status;
    await visitor.save();

    return res.status(200).json({
      message: "Visitor status updated successfully",
      visitor,
    });
  } catch (error) {
    console.error("Update Visitor Status Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid visitor ID",
      });
    }

    return res.status(500).json({
      message: "Error updating visitor status",
    });
  }
};

// DELETE: Delete a visitor
export const deleteVisitor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = String(req.user?.role || "").toLowerCase();
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!["resident", "admin"].includes(role)) {
      return res.status(403).json({
        message:
          "You do not have permission to delete visitors",
      });
    }

    const filter =
      role === "admin"
        ? { _id: id }
        : { _id: id, resident_id: userId };

    const deletedVisitor = await Visitor.findOneAndDelete(filter);

    if (!deletedVisitor) {
      return res.status(404).json({
        message: "Visitor record not found",
      });
    }

    return res.status(200).json({
      message: "Visitor deleted successfully",
    });
  } catch (error) {
    console.error("Delete Visitor Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid visitor ID",
      });
    }

    return res.status(500).json({
      message: "Error deleting visitor",
    });
  }
};
