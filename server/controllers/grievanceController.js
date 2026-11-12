import Grievance from '../models/Grievance.js';
import { checkEscalation } from '../utils/escalationEngine.js';
import { analyzeComplaint } from '../ai-engine/services/moderationService.js';

// @desc    Get all public grievances (sorted by votes)
// @route   GET /api/grievances
// @access  Private
export const getGrievances = async (req, res, next) => {
  try {
    const { department, status, sort } = req.query;

    // Build query - exclude confidential grievances from public feed
    let query = { isConfidential: false,
                  feedSection:{$ne: 'rejected'}
     };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    // Determine sort order
    let sortOption = { voteCount: -1, createdAt: -1 };
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const grievances = await Grievance.find(query)
      .sort(sortOption)
      .select('-reportedBy -upvotes -attachments')
      .lean();

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single grievance by ID
// @route   GET /api/grievances/:id
// @access  Private
export const getGrievanceById = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .select('-reportedBy -upvotes');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // Check if confidential and user is not admin
    if (grievance.isConfidential && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to confidential grievance'
      });
    }

    res.status(200).json({
      success: true,
      grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new grievance
// @route   POST /api/grievances
// @access  Private (requires Action PIN)
export const createGrievance = async (req, res, next) => {
  try {
    const { title, description, department, category, isConfidential } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // ==========================================
    // 🤖 AI MODERATION LAYER
    // ==========================================
    let aiResult = { isComplaint: true, category: category || 'Other' };
    let aiFailed = false;
    let isFlaggedByAI = false; // 👈 Naya flag

    try {
      const response = await analyzeComplaint(title, description);
      
      // Agar AI bole spam/venting hai
      if (response.isComplaint === false) {
        isFlaggedByAI = true; // 👈 Flag set karo, par return mat karo
      }

      aiResult = response;
      
    } catch (error) {
      console.warn('⚠️ AI Moderation Failed:', error.message);
      aiFailed = true;
    }

    // ==========================================
    // CATEGORY & SENSITIVITY LOGIC
    // ==========================================
    if(category==='other'){
      category=aiResult.category;
    }
    let finalCategory = category || aiResult.category;
    
    if (finalCategory === 'None' || finalCategory === 'self') {
      finalCategory = 'Other';
    }

        let finalDepartment = (department && department !== 'Other' && department !== '') 
                          ? department 
                          : (aiResult.department || 'Other');

    const sensitiveCategories = ['Harassment', 'Ragging', 'Discrimination', 'Ragging/Harassment'];
    const isSensitive = sensitiveCategories.includes(finalCategory);
    const finalIsConfidential = isConfidential === 'true' || isConfidential === true || isSensitive;

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // ==========================================
    // FEED SECTION LOGIC (AI Rejection Handle)
    // ==========================================
    let finalFeedSection = 'raw'; // Default
    
    if (isFlaggedByAI) {
      finalFeedSection = 'rejected'; // 👈 Agar AI ne reject kiya toh yahan jayega
    }

    // ==========================================
    // SAVE TO DATABASE
    // ==========================================
    const grievance = await Grievance.create({
      title,
      description,
      department:finalDepartment,
      category: finalCategory,
      isConfidential: finalIsConfidential,
      attachments,
      reportedBy: req.user._id,
      feedSection: finalFeedSection, // 👈 Rejected complaints yahan save hongi
      statusHistory: [{
        status: isFlaggedByAI ? 'in-review' : 'submitted', // AI ne reject kiya toh in-review
        remarks: isFlaggedByAI 
          ? 'Flagged by AI as potential spam/venting. Pending Admin review.' 
          : 'Grievance submitted successfully',
        updatedBy: req.user._id
      }]
    });

    // ==========================================
    // RESPONSE TO FRONTEND
    // ==========================================
    res.status(201).json({
      success: true, // 👈 Success true hi rahega
      message: isFlaggedByAI
        ? 'Your complaint has been submitted. However, our AI flagged it for manual review by the admin.'
        : (grievance.isConfidential
            ? 'Confidential grievance submitted. It will be reviewed by the appropriate committee.'
            : 'Grievance submitted successfully'),
      isFlagged: isFlaggedByAI,
      aiProcessed: !aiFailed,
      grievance: {
        _id: grievance._id,
        title: grievance.title,
        department: grievance.department,
        category: grievance.category,
        status: grievance.status,
        isConfidential: grievance.isConfidential,
        createdAt: grievance.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a grievance
// @route   POST /api/grievances/:id/upvote
// @access  Private (requires Action PIN)
export const upvoteGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // Check if confidential
    if (grievance.isConfidential) {
      return res.status(403).json({
        success: false,
        message: 'Cannot vote on confidential grievances'
      });
    }

    // Check for duplicate vote (NFR6 - Data Integrity)
    if (grievance.upvotes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already Voted',
        alreadyVoted: true
      });
    }

    // Add upvote
    grievance.upvotes.push(req.user._id);
    grievance.voteCount = grievance.upvotes.length;
    await grievance.save();

    // Check escalation threshold
    await checkEscalation(grievance);

    res.status(200).json({
      success: true,
      message: 'Vote registered successfully',
      voteCount: grievance.voteCount,
      isHighPriority: grievance.isHighPriority
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own grievances
// @route   GET /api/grievances/my
// @access  Private
export const getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ reportedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('-upvotes');

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user has voted on a grievance
// @route   GET /api/grievances/:id/vote-status
// @access  Private
export const getVoteStatus = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id).select('upvotes');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    const hasVoted = grievance.upvotes.includes(req.user._id);

    res.status(200).json({
      success: true,
      hasVoted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grievance statistics
// @route   GET /api/grievances/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const totalGrievances = await Grievance.countDocuments({ isConfidential: false });
    const resolved = await Grievance.countDocuments({ status: 'resolved', isConfidential: false });
    const inProgress = await Grievance.countDocuments({ status: 'in-progress', isConfidential: false });
    const highPriority = await Grievance.countDocuments({ isHighPriority: true, isConfidential: false });

    res.status(200).json({
      success: true,
      stats: {
        total: totalGrievances,
        resolved,
        inProgress,
        highPriority,
        pending: totalGrievances - resolved - inProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grievances for Scroll Feed (Tabs: trending, approved, raw, pending)
// @route   GET /api/grievances/feed
// @access  Private
export const getScrollFeed = async (req, res, next) => {
    try {
    // Abhi ke liye humne tab filtering hata di hai, taaki sab dikhe
    // Sirf Confidential aur Rejected ko hata rahe hain
    let query = { 
      isConfidential: false,
      feedSection: { $ne: 'rejected' } // Rejected nahi aayengi
    };

    // Data fetch karein. 
    // Sort: Pehle unko dikhao jinpe zyada votes hain, fir naye wale ko.
    const grievances = await Grievance.find(query)
      .sort({ voteCount: -1, createdAt: -1 }) 
      .select('-reportedBy -upvotes -officialRemarks -statusHistory') 
      .lean();

    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a grievance
// @route   POST /api/grievances/:id/comment
export const addComment = async (req, res, next) => {
  try {
    const { text, isAnonymous } = req.body; // Frontend se isAnonymous aayega
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found' });
    }

    const newComment = {
      text,
      user: req.user._id,
      isAnonymous: isAnonymous !== false, // Agar false nahi bheja, toh default true (anonymous)
      isOfficial: req.user.role === 'admin' || req.user.role === 'faculty'
    };

    grievance.comments.push(newComment);
    await grievance.save();

    // Frontend ko response bhejte waqt hum user details bhi populate kar sakte hain
    // taaki agar anonymous ho toh naam na dikhe, aur agar real name ho toh dikhe.
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comments: grievance.comments
    });
  } catch (error) {
    next(error);
  }
};