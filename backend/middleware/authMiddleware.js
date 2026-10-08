import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  // Read token from HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access, please login" });
  }

  try {
    // Verify JWT token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};