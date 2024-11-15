const UserModel = require('../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

// Signup function
exports.signup = async (req, res) => {
  try {
    const user = new UserModel(req.body);
    await user.save();
    res.json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

// Fetch all users function
exports.users = async (req, res) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Fetch authenticated user function
exports.me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};
