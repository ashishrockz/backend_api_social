const express = require("express");
const mongoose = require("mongoose"); // Import mongoose
const router = express.Router();
const LeaveRequest = require("../model/Leaves"); // Assuming Leave model is in the 'models' folder

// Apply for leave
router.post("/leave/apply", async (req, res) => {
  try {
    const { employeeId,leaveType, startDate, endDate, reason } = req.body;

    // Check for overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      employeeId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
      status: "Approved",
    });

    if (overlappingLeave) {
      return res.status(400).json({ message: "Overlapping leave already exists." });
    }

    const leaveRequest = new LeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leaveRequest.save();
    res.status(201).json({ message: "Leave request submitted successfully!", leaveRequest });
  } catch (error) {
    res.status(500).json({ message: "Error applying for leave", error: error.message });
  }
});



// Approve or reject leave
router.put("/leave/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { approverRole, status } = req.body; // approverRole can be "teamLead" or "manager"

    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) return res.status(404).json({ message: "Leave request not found" });

    // Validate manager approval only after team lead approval
    if (approverRole === "manager" && leaveRequest.approver.teamLead.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Manager approval is not allowed until the team lead approves" });
    }

    // Update the status for the approver
    if (approverRole === "teamLead") {
      leaveRequest.approver.teamLead.status = status;
      leaveRequest.approver.teamLead.approvedAt = new Date();
    } else if (approverRole === "manager") {
      leaveRequest.approver.manager.status = status;
      leaveRequest.approver.manager.approvedAt = new Date();
    }

    // Final approval logic
    if (
      leaveRequest.approver.teamLead.status === "Approved" &&
      leaveRequest.approver.manager.status === "Approved"
    ) {
      leaveRequest.status = "Approved";
    } else if (
      leaveRequest.approver.teamLead.status === "Rejected" ||
      leaveRequest.approver.manager.status === "Rejected"
    ) {
      leaveRequest.status = "Rejected";
    }else if (
      leaveRequest.approver.teamLead.status === "Pending" ||
      leaveRequest.approver.manager.status === "Approved"
    ) {
      leaveRequest.status = "Pending";
    }else if (
      leaveRequest.approver.teamLead.status === "Approved" ||
      leaveRequest.approver.manager.status === "Pending"
    ) {
      leaveRequest.status = "Pending";
    }else if (
      leaveRequest.approver.teamLead.status === "Pending" ||
      leaveRequest.approver.manager.status === "Pending"
    ) {
      leaveRequest.status = "Pending";
    }

    await leaveRequest.save();
    res.status(200).json({ message: `Leave ${status.toLowerCase()} by ${approverRole}`, leaveRequest });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave status", error: error.message });
  }
});


// Get all leave requests
router.get("/leave/all", async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find();
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
});
// router.get("/leave/all", async (req, res) => {
//   try {
//     // Fetch leave requests where team lead has approved
//     const leaveRequests = await LeaveRequest.find({
//       "approver.teamLead.status": "Approved", // Filter for team lead approval
//     });
//     res.status(200).json(leaveRequests);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching leave requests", error: error.message });
//   }
// });

// Get leave requests by employee ID
router.get("/leave/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaveRequests = await LeaveRequest.find({ employeeId });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave requests", error: error.message });
  }
});
// Get individual leave request by leaveId
router.get("/leave/details/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    
    // Fetch the leave request by leaveId
    const leaveRequest = await LeaveRequest.findById(leaveId);
    
    // If leave request not found, return 404
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Return the leave request details
    res.status(200).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave request details", error: error.message });
  }
});

// Delete leave request
router.delete("/leave/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;

    // Check if the leave request exists
    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Delete the leave request
    await LeaveRequest.findByIdAndDelete(leaveId);

    res.status(200).json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave request", error: error.message });
  }
});

module.exports = router;
