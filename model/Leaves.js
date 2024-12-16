// Required libraries
const mongoose = require("mongoose");

// Define the Leaves Schema
const leaveSchema = new mongoose.Schema(
  {
      employeeId: { type: String, required: true }, // Use String instead of ObjectId

    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Paid Leave", "Maternity Leave", "Paternity Leave"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approver: {
      teamLead: { status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, approvedAt: Date },
      manager: { status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, approvedAt: Date },
    },
    appliedAt: { type: Date, default: Date.now },
    history: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedFields: { type: Object, default: {} },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save middleware to update the updatedAt field
leaveSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    const err = new Error('Start Date cannot be later than End Date');
    next(err);
  } else {
    next();
  }
});

// Export the Leave model
module.exports = mongoose.model("Leave", leaveSchema);
