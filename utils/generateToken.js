// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  try {
    // Don't try to handle both raw tokens and request objects in the same function
    // Just verify the token that's passed in
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    return verified;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
