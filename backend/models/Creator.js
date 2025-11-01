import mongoose from "mongoose";
import bcrypt from "bcrypt";

const creatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    role: { 
      type: String, 
      enum: ["creator", "admin", "customer"], 
      default: "creator" 
    }
    // ❌ No fabrics array needed (creators don't add fabrics)
  },
  { timestamps: true }
);

// ✅ Hash password before saving
creatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Method to compare passwords
creatorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Creator", creatorSchema);
