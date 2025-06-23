import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ICustomerDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nearestAddress?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  customer: ICustomerDetails;
  items: IOrderItem[];
  total: number;
  deliveryLocation: string;
  deliveryFee: number;
  paymentMethod: "payOnDelivery" | "payBeforeDelivery"; // Updated to match frontend
  status: "pending" | "delivered";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      nearestAddress: { type: String },
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    deliveryLocation: { type: String, required: true },
    deliveryFee: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["payOnDelivery", "payBeforeDelivery"], // Updated to match frontend
      default: "payOnDelivery",
    },
    status: {
      type: String,
      enum: ["pending", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
