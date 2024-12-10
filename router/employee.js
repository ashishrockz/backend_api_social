const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../model/Employee"); // Adjust the path based on your directory structure
require('dotenv').config();

const router = express.Router();

// Add a new employee
router.post("/add", async (req, res) => {
  try {
    const { employeeId, firstName, middleName, lastName, phone, personalMail, companyMail, password, address, department, profilePic, isAdmin, status } = req.body;

    // Check if company email is already registered
    const existingEmployee = await Employee.findOne({ companyMail });
    if (existingEmployee) {
      return res.status(400).json({ message: "Company email already in use." });
    }

    // Create a new employee
    const newEmployee = new Employee({
      employeeId,
      firstName,
      middleName,
      lastName,
      phone,
      personalMail,
      companyMail,
      password,
      address,
      department,
      profilePic,
      isAdmin,
      status,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully!", employee: newEmployee });
  } catch (error) {
    res.status(500).json({ message: "Error adding employee", error: error.message });
  }
});

// Get all employees
router.get("/all", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
});

// Get an individual employee by ID
router.get("/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error: error.message });
  }
});

// Employee login
router.post("/login", async (req, res) => {
  try {
    const { companyMail, password } = req.body;

    // Validate employee credentials
    const employee = await Employee.findOne({ companyMail });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: employee._id, isAdmin: employee.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        companyMail: employee.companyMail,
        department: employee.department,
        isAdmin: employee.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error: error.message });
  }
});

// Update Employee
router.put('/:id', async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).json({ error: 'Employee not found' });
  
      // Identify updated fields
      const updatedFields = {};
      for (const key in req.body) {
        if (req.body[key] !== employee[key]) {
          updatedFields[key] = { old: employee[key], new: req.body[key] };
        }
      }
  
      // Update employee data
      Object.assign(employee, req.body);
  
      // Add update details to history
      if (Object.keys(updatedFields).length > 0) {
        employee.history.push({ updatedFields, updatedAt: new Date() });
      }
  
      await employee.save();
      res.status(200).json(employee);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });;


module.exports = router;
