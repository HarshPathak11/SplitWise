// utils/jwt.js
import jwt from "jsonwebtoken";

export const signAccessToken = (userId) => {
  return jwt.sign(
    {
      sub: userId.toString(), // subject = user id
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }
  );
};
