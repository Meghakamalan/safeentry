import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authenticated. Please log in.",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // The login controller should sign the token with:
        // { id: user._id, role: user.role }
        req.user = decoded;

        if (!req.user.id && !req.user._id) {
            return res.status(401).json({
                message: "Invalid authentication token.",
            });
        }

        next();
    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            message:
                "Your session is invalid or expired. Please log in again.",
        });
    }
};
