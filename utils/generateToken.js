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
    const local_token = token?.headers?.authorization
      ? token?.headers?.authorization.split("Bearer ")[1]
      : token;
    console.log(local_token);
    const verified = jwt.verify(
      local_token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );

    return verified;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
