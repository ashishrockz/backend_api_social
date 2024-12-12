// Required libraries
const mongoose = require("mongoose");

// Define the Leaves Schema
const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Paid Leave", "Maternity Leave", "Paternity Leave"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming managers or admins are part of the Employee schema
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save middleware to update the updatedAt field
leaveSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Export the Leave model
module.exports = mongoose.model("Leave", leaveSchema);