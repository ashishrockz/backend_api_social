const UserModel = require('../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const router = express.Router();

// Signup function
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(403).json({ message: 'Please Login' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Failed to authenticate token:', err.message);
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// Login route
router.post('/login', async (req, res) => {
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
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const user = new UserModel(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Fetch users route
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await UserModel.find({}); // Fetch only necessary fields
    res.json(users); 
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
// router.get('/user', verifyToken, async (req, res) => {
//   try {
//     const users = await UserModel.findById(req.params.id); // Fetch only necessary fields
//     res.json(users); 
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Failed to fetch users' });
//   }
// });
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select('-password'); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Return the user object
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});


module.exports = router;