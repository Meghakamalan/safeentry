import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper for cookie options to maintain consistency across login & logout
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",// falls in local development
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

// Register
export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role || "resident", // Allows assigning guard or admin roles
    });

    res.status(201).json({
      message: "Registration Successful !",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Force password inclusion in case `select: false` is set on the schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password !",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
      message: "Login Successful !",
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server Error !",
    });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({
    message: "Logout Successful !",
  });
};
