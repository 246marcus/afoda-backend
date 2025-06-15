import { Request, Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Remove IUser import
import { AuthRequest } from "../middleware/authMiddleware";

// Generate JWT (UNCHANGED)
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// Register (FIXED)
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body; // Changed from 'name'

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // REMOVED MANUAL HASHING - schema handles it
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // Pass plain password - pre-save hook will hash it
    });

    const token = generateToken(newUser._id.toString());

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName, // Now valid
        lastName: newUser.lastName, // Now valid
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (FIXED)
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password); // Use model method
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString());

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".afoda.store",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName, // Now valid
        lastName: user.lastName, // Now valid
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout (UNCHANGED)
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile (FIXED)
export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName, // Now valid
        lastName: user.lastName, // Now valid
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
