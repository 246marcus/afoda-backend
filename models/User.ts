import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string; // Changed from 'name'
  lastName: string; // Added new field
  email: string;
  password: string;
  _id: mongoose.Types.ObjectId;
  role: "customer" | "retailer" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true }, // Split into two fields
    lastName: { type: String, required: true }, // Both required
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "retailer", "admin"],
      default: "customer",
    },
  },
  { timestamps: true }
);

// Hash password before saving (UNCHANGED)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method (UNCHANGED)
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
