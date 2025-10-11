import mongoose from "mongoose";
import bcrypt from "bcrypt";

const creatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "https://via.placeholder.com/150",
    },

    // 🧵 Link between Creator → Fabrics
    fabrics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fabric",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
creatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Creator", creatorSchema);
