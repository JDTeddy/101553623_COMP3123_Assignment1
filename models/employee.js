const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true, maxlength: 50 },
    last_name: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email format is invalid"],
    },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    salary: { type: Number, required: true, min: [0.01, "Salary must be positive"] },
    date_of_joining: { type: Date, required: true },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    // Ownership: a reference to the User who created this employee (like a foreign key)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    // Mongoose fills in created_at and updated_at for us (Week 6 used { timestamps: true })
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false, // hides the internal __v field
  }
);

employeeSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Employee", employeeSchema);