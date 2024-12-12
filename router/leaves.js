// Create Leave Request
const express = require("express");
const router = express.Router();
const Leave = require("../model/Leaves"); // Assuming Leave model is in the 'models' folder

// Route to create a leave
router.post("/create", async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, approvalLevels } = req.body;
    
    const newLeave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      approvalLevels,
    });
    
    const savedLeave = await newLeave.save();
    res.status(201).json(savedLeave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/all", async (req, res) => {
    try {
      const leaves = await Leave.find().populate("employeeId").populate("approvalLevels.approverId");
      res.status(200).json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  router.get("/employee/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const leaves = await Leave.find({ employeeId }).populate("approvalLevels.approverId");
      res.status(200).json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  // Update Leave Request
router.patch("/update/:leaveId", async (req, res) => {
    try {
      const { leaveId } = req.params;
      const { status, approvalLevels, approvedBy } = req.body;
  
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return res.status(404).json({ error: "Leave request not found" });
      }
  
      // Update the status and approval levels
      if (status) {
        leave.status = status;
      }
  
      if (approvalLevels) {
        leave.approvalLevels = approvalLevels;
      }
  
      if (approvedBy) {
        leave.approvedBy = approvedBy;
      }
  
      leave.updatedAt = Date.now();
      await leave.save();
      res.status(200).json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
module.exports = router;
