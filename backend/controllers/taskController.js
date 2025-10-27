const Task = require('../models/Task');
const RegularUser = require('../models/RegularUser');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      status: status || 'pending',
      creatorId: req.user._id,
      creatorModel: req.userModel
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks based on role
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const { status, dueDate, search } = req.query;
    let query = {};

    // Role-based filtering
    if (req.userRole === 'user') {
      // Regular users see only their own tasks
      query.creatorId = req.user._id;
    } else if (req.userRole === 'manager') {
      // Managers see their tasks + tasks of assigned users
      const assignedUserIds = req.user.assignedUsers || [];
      query.$or = [
        { creatorId: req.user._id },
        { creatorId: { $in: assignedUserIds } }
      ];
    }
    // Admin sees all tasks (no filter needed)

    // Status filter
    if (status) {
      query.status = status;
    }

    // Due date filter
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    // Search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const tasks = await Task.find(query)
      .populate('creatorId', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('creatorId', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.userRole === 'user' && task.creatorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    if (req.userRole === 'manager') {
      const assignedUserIds = req.user.assignedUsers.map(id => id.toString());
      if (task.creatorId._id.toString() !== req.user._id.toString() && 
          !assignedUserIds.includes(task.creatorId._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.userRole === 'user' && task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (req.userRole === 'manager') {
      const assignedUserIds = req.user.assignedUsers.map(id => id.toString());
      if (task.creatorId.toString() !== req.user._id.toString() && 
          !assignedUserIds.includes(task.creatorId.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    }

    const { title, description, status, dueDate } = req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, dueDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.userRole === 'user' && task.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    if (req.userRole === 'manager') {
      const assignedUserIds = req.user.assignedUsers.map(id => id.toString());
      if (task.creatorId.toString() !== req.user._id.toString() && 
          !assignedUserIds.includes(task.creatorId.toString())) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
      }
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks statistics (for dashboard)
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    let matchQuery = {};

    if (req.userRole === 'user') {
      matchQuery.creatorId = req.user._id;
    } else if (req.userRole === 'manager') {
      const assignedUserIds = req.user.assignedUsers || [];
      matchQuery.$or = [
        { creatorId: req.user._id },
        { creatorId: { $in: assignedUserIds } }
      ];
    }

    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
