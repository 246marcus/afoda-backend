import express, { Response } from "express";
import Order from "../models/Order"; // Adjust path as needed
import { protect, AuthRequest } from "../middleware/authMiddleware"; // Use your existing middleware

const router = express.Router();

// POST /api/orders - Create a new order
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  console.log("🚀 ORDER CREATION STARTED");
  console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
  console.log("👤 Authenticated User ID:", req.userId);
  console.log("🍪 Request Cookies:", req.cookies);

  try {
    const {
      userId,
      customer,
      items,
      total,
      deliveryLocation,
      deliveryFee,
      paymentMethod,
    } = req.body;

    // Use userId from the authenticated request instead of body
    const authenticatedUserId = req.userId;

    console.log("🔍 Validation Check:");
    console.log("- authenticatedUserId:", authenticatedUserId);
    console.log("- customer:", customer);
    console.log("- items:", items);
    console.log("- total:", total);
    console.log("- deliveryLocation:", deliveryLocation);

    // Validate required fields
    if (
      !authenticatedUserId ||
      !customer ||
      !items ||
      !total ||
      !deliveryLocation
    ) {
      console.log("❌ VALIDATION FAILED - Missing required fields");
      res.status(400).json({
        message: "Missing required fields",
        debug: {
          authenticatedUserId: !!authenticatedUserId,
          customer: !!customer,
          items: !!items,
          total: !!total,
          deliveryLocation: !!deliveryLocation,
        },
      });
      return;
    }

    console.log("✅ Validation passed, creating order...");

    // Create new order using the authenticated user's ID
    const orderData = {
      userId: authenticatedUserId,
      customer,
      items,
      total,
      deliveryLocation,
      deliveryFee: deliveryFee || 0,
      paymentMethod,
      status: "pending",
    };

    console.log("📝 Order Data to Save:", JSON.stringify(orderData, null, 2));

    const newOrder = new Order(orderData);
    console.log("🏗️ Order instance created, saving to DB...");

    const savedOrder = await newOrder.save();
    console.log("✅ ORDER SAVED SUCCESSFULLY!");
    console.log("🆔 Saved Order ID:", savedOrder._id);
    console.log("📊 Saved Order:", JSON.stringify(savedOrder, null, 2));

    res.status(201).json({
      _id: savedOrder._id,
      customer: savedOrder.customer,
      items: savedOrder.items,
      total: savedOrder.total,
      deliveryLocation: savedOrder.deliveryLocation,
      deliveryFee: savedOrder.deliveryFee,
      paymentMethod: savedOrder.paymentMethod,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("💥 ERROR CREATING ORDER:");
    console.error("Error type:", typeof error);
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    console.error("Full error:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      console.error("🚫 Mongoose Validation Error Details:", error);
    }

    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      debug: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// GET /api/orders - Get user's orders
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  console.log("📋 FETCHING ORDERS FOR USER:", req.userId);

  try {
    const userId = req.userId;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    console.log(`📊 Found ${orders.length} orders for user ${userId}`);

    res.json(orders);
  } catch (error) {
    console.error("💥 Error fetching orders:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/orders/:id - Get specific order
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  console.log(
    "🔍 FETCHING SPECIFIC ORDER:",
    req.params.id,
    "for user:",
    req.userId
  );

  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId });
    console.log("📋 Order found:", !!order);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error("💥 Error fetching order:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
