const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const RegularUser = require('../models/RegularUser');

// @desc    Create a new manager (Admin only)
// @route   POST /api/users/managers
// @access  Private/Admin
exports.createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const emailExists = await Manager.findOne({ email }) || 
                       await Admin.findOne({ email }) || 
                       await RegularUser.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = await Manager.create({
      name,
      email,
      password: hashedPassword,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: 'manager'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new regular user (Admin or Manager)
// @route   POST /api/users/regular-users
// @access  Private/Admin/Manager
exports.createRegularUser = async (req, res) => {
  try {
    const { name, email, password, managerId } = req.body;

    // Check if email already exists
    const emailExists = await Manager.findOne({ email }) || 
                       await Admin.findOne({ email }) || 
                       await RegularUser.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      createdBy: req.user._id,
      createdByModel: req.userModel
    };

    // If manager is creating, assign themselves; if admin is creating, use provided managerId
    if (req.userRole === 'manager') {
      userData.managerId = req.user._id;
    } else if (managerId) {
      userData.managerId = managerId;
    }

    const regularUser = await RegularUser.create(userData);

    // If managerId is provided, add user to manager's assignedUsers
    if (regularUser.managerId) {
      await Manager.findByIdAndUpdate(
        regularUser.managerId,
        { $push: { assignedUsers: regularUser._id } }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        id: regularUser._id,
        name: regularUser.name,
        email: regularUser.email,
        role: 'user',
        managerId: regularUser.managerId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all managers (Admin only)
// @route   GET /api/users/managers
// @access  Private/Admin
exports.getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find().select('-password').populate('assignedUsers', 'name email');
    
    res.status(200).json({
      success: true,
      count: managers.length,
      data: managers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all regular users
// @route   GET /api/users/regular-users
// @access  Private
exports.getAllRegularUsers = async (req, res) => {
  try {
    let query = {};
    
    // If manager, only show their assigned users
    if (req.userRole === 'manager') {
      query.managerId = req.user._id;
    }

    const users = await RegularUser.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign user to manager (Admin only)
// @route   PUT /api/users/assign-manager
// @access  Private/Admin
exports.assignManagerToUser = async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    const user = await RegularUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Remove from old manager if exists
    if (user.managerId) {
      await Manager.findByIdAndUpdate(
        user.managerId,
        { $pull: { assignedUsers: userId } }
      );
    }

    // Update user's manager
    user.managerId = managerId;
    await user.save();

    // Add to new manager's assignedUsers
    await Manager.findByIdAndUpdate(
      managerId,
      { $addToSet: { assignedUsers: userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Manager assigned successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete from both collections
    let user = await Manager.findByIdAndDelete(id);
    let userType = 'manager';

    if (!user) {
      user = await RegularUser.findByIdAndDelete(id);
      userType = 'user';

      // Remove from manager's assignedUsers if exists
      if (user && user.managerId) {
        await Manager.findByIdAndUpdate(
          user.managerId,
          { $pull: { assignedUsers: id } }
        );
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `${userType} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
