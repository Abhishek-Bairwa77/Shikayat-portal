import Grievance from '../models/Grievance.js';

// @desc    Get all grievances (including confidential) for admin
// @route   GET /api/admin/grievances
// @access  Private/Admin
export const getAllGrievances = async (req, res, next) => {
  try {
    const { department, status, isConfidential, sort } = req.query;

    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (isConfidential !== undefined) {
      query.isConfidential = isConfidential === 'true';
    }

    let sortOption = { voteCount: -1, createdAt: -1 };
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const grievances = await Grievance.find(query)
      .sort(sortOption)
      .populate('reportedBy', 'rollNumber department')
      .populate('assignedTo', 'username');

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get confidential grievances only
// @route   GET /api/admin/confidential
// @access  Private/Admin
export const getConfidentialGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ isConfidential: true })
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'rollNumber department')
      .populate('assignedTo', 'username');

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grievance status
// @route   PUT /api/admin/grievances/:id/status
// @access  Private/Admin
export const updateGrievanceStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const validStatuses = ['submitted', 'in-review', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.status = status;
    if (remarks) {
      grievance.officialRemarks = remarks;
    }

    grievance.statusHistory.push({
      status,
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    await grievance.save();

    res.status(200).json({
      success: true,
      message: 'Grievance status updated',
      grievance: {
        _id: grievance._id,
        status: grievance.status,
        officialRemarks: grievance.officialRemarks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign grievance to faculty
// @route   PUT /api/admin/grievances/:id/assign
// @access  Private/Admin
export const assignGrievance = async (req, res, next) => {
  try {
    const { facultyId } = req.body;

    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { assignedTo: facultyId },
      { new: true }
    ).populate('assignedTo', 'username email');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Grievance assigned successfully',
      grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const total = await Grievance.countDocuments();
    const confidential = await Grievance.countDocuments({ isConfidential: true });
    const escalated = await Grievance.countDocuments({ isEscalated: true });
    const resolved = await Grievance.countDocuments({ status: 'resolved' });
    const pending = await Grievance.countDocuments({
      status: { $in: ['submitted', 'in-review', 'in-progress'] }
    });

    // Department-wise breakdown
    const departmentStats = await Grievance.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        confidential,
        escalated,
        resolved,
        pending,
        departmentStats
      }
    });
  } catch (error) {
    next(error);
  }
};