const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const RegularUser = require('../models/RegularUser');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check in all user collections
    let user = await Admin.findOne({ email });
    let role = 'admin';
    let userModel = 'Admin';

    if (!user) {
      user = await Manager.findOne({ email });
      role = 'manager';
      userModel = 'Manager';
    }

    if (!user) {
      user = await RegularUser.findOne({ email });
      role = 'user';
      userModel = 'RegularUser';
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
      console.log(user.password)
      console.log(password)

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: req.userRole
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create initial admin (run once)
// @route   POST /api/auth/create-admin
// @access  Public (should be secured in production)
exports.createInitialAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists. This route is disabled.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
