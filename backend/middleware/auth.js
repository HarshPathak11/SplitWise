import jwt from "jsonwebtoken";
import { User } from "../models/schema.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const id = req?.headers.id;

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
    if(String(id) !== String(payload?.sub)) return res.status(401).json({message: "Unauthorised"});

    // minimal info attached to request
    req.user = {
      id: payload.sub,
    };

    // Update lastActive timestamp (fire and forget)
    User.findByIdAndUpdate(payload.sub, { lastActive: new Date() }).catch((err) =>
      console.error("Error updating lastActive:", err)
    );

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
