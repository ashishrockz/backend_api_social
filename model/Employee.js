const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    personalMail: { type: String },
    companyMail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    department: {
      type: String,
      enum: [
        "BA",
        "Development",
        "Designing",
        "UI",
        "Testing",
        "HR",
        "TeamLead",
        "Manager",
        "System Admin",
      ],
      required: true,
    },
    profilePic: String,
    isAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // History of changes
    history: [
      {
        updatedAt: { type: Date, default: Date.now }, // Timestamp of update
        updatedFields: { type: Object, default: {} }, // Fields that were updated
      },
    ],
  },
  { timestamps: true }
);
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
module.exports = mongoose.model("Employee", employeeSchema);
