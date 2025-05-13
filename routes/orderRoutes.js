import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../utils/generateToken.js";

import mongoose from "mongoose";

const router = express.Router();

// Enhanced JSON response middleware
const jsonResponse = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
};

router.use(express.json()); // Parse JSON bodies
router.use(jsonResponse); // Ensure JSON responses

// Create new order
router.post("/", async (req, res) => {
  const isVerified = verifyToken(req);

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: "Not Authorized",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
  console.log("first");
  try {
    const {
      customer,
      items,
      total,
      deliveryLocation,
      deliveryFee,
      paymentMethod,
      userId,
    } = req.body;

    console.log(req.body);

    console.log("runnung");

    // Validate required fields
    const missingFields = [];
    if (!customer?.name) missingFields.push("customer.name");
    if (!customer?.phone) missingFields.push("customer.phone");
    if (!Array.isArray(items) || items.length === 0)
      missingFields.push("items");
    if (typeof total !== "number" || total <= 0) missingFields.push("total");
    if (!deliveryLocation) missingFields.push("deliveryLocation");
    if (typeof deliveryFee !== "number" || deliveryFee < 0)
      missingFields.push("deliveryFee");
    if (!["cash", "card", "transfer"].includes(paymentMethod)) {
      missingFields.push("paymentMethod");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid fields",
        missingFields,
      });
    }

    // Create order document
    const order = new Order({
      userId: isVerified.id,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || undefined,
        nearestAddress: customer.nearestAddress || undefined,
      },
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
      deliveryLocation,
      deliveryFee,
      paymentMethod,
      status: "pending",
    });

    // Save to database
    const savedOrder = await order.save();

    // Successful response
    return res.status(201).json({
      success: true,
      order: savedOrder.toObject(),
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

router.get("/", async (req, res) => {
  const isVerified = verifyToken(req.cookies.token);

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: "Not Authorized",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
  console.log(isVerified);
  try {
    const orders = await Order.find({ userId: isVerified.id });

    console.log(orders);
    // Successful response
    return res.status(201).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

router.get("/admin", async (req, res) => {
  const isVerified = verifyToken(req.cookies.token);

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: "Not Authorized",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
  console.log(isVerified);
  try {
    const orders = await Order.find();
    // Successful response
    return res.status(201).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

router.get("/retailer", async (req, res) => {
  console.log(req.cookies);
  const isVerified = verifyToken(req.cookies.token);

  if (!isVerified) {
    return res.status(403).json({
      success: false,
      message: "Not Authorized",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
  console.log(isVerified);
  try {
    const orders = await Order.find();
    // Successful response
    return res.status(201).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
});

// orderRoute.js
router.patch("/:id/deliver", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.isDelivered = true;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// [Keep all other routes exactly the same as in your original file]

export default router;
