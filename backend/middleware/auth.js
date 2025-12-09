// middleware/auth.js
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"], // ✅ do NOT allow "none" or others
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      clockTolerance: 5, // small leeway in seconds
    });

    // minimal info attached to request
    req.user = {
      id: payload.sub,
    };

    return next();
  } catch (err) {
    console.error("JWT verify error:", err);

    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
