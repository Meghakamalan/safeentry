import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// Check whether the logged-in user is an admin
const isAdmin = (req) => {
  return String(req.user?.role || "").toLowerCase() === "admin";
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};

// Create a user
export const createUser = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      unit_number,
      password,
      role,
    } = req.body;

    // Required fields: unit_number is intentionally optional
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "First name, last name, email, phone, and password are required.",
      });
    }

    // Validate role
    const allowedRoles = ["Resident", "Guard", "Admin"];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether the email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    // Unit number is optional
    const normalizedUnitNumber =
      typeof unit_number === "string" ? unit_number.trim() : "";

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      unit_number: normalizedUnitNumber,
      password: hashedPassword,
      role: role || "Resident",
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        unit_number: newUser.unit_number,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create user.",
    });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      unit_number,
      role,
    } = req.body;

    // Required fields: unit_number is intentionally optional
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !role
    ) {
      return res.status(400).json({
        message:
          "First name, last name, email, phone, and role are required.",
      });
    }

    const allowedRoles = ["Resident", "Guard", "Admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether another user already uses this email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Another user with this email already exists.",
      });
    }

    // Build update data
    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role,
    };

    // Update unit number only when the field is included.
    // An empty string clears the unit number.
    if (typeof unit_number === "string") {
      updateData.unit_number = unit_number.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Another user with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update user.",
    });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    // Prevent an admin from deleting their own account
    const loggedInUserId = String(
      req.user?.id || req.user?._id || ""
    );

    if (loggedInUserId === id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Failed to delete user.",
    });
  }
};
