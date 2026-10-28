import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { rollNumber, username, email, mobile, password, actionPin, department } = req.body;

    // Validate required fields
    if (!rollNumber || !username || !email || !password || !actionPin || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate Action PIN format
    if (!/^\d{4}$/.test(actionPin)) {
      return res.status(400).json({
        success: false,
        message: 'Action PIN must be exactly 4 digits'
      });
    }

    // Check if user exists (1 Roll Number = 1 Account policy)
    const existingUser = await User.findOne({
      $or: [{ rollNumber: rollNumber.toUpperCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      if (existingUser.rollNumber === rollNumber.toUpperCase()) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Roll Number already exists'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      rollNumber: rollNumber.toUpperCase(),
      username,
      email: email.toLowerCase(),
      mobile,
      password,
      actionPin,
      department
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        username: user.username,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide login credentials'
      });
    }

    // Find user by roll number, username, or email
    const user = await User.findOne({
      $or: [
        { rollNumber: identifier.toUpperCase() },
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        username: user.username,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        rollNumber: user.rollNumber,
        username: user.username,
        email: user.email,
        department: user.department,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Action PIN
// @route   POST /api/auth/verify-pin
// @access  Private
export const verifyPin = async (req, res, next) => {
  try {
    const { actionPin } = req.body;

    if (!actionPin || !/^\d{4}$/.test(actionPin)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 4-digit Action PIN required'
      });
    }

    const user = await User.findById(req.user._id).select('+actionPin');
    const isValid = await user.matchPin(actionPin);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Action PIN'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Action PIN verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Action PIN
// @route   PUT /api/auth/update-pin
// @access  Private
export const updatePin = async (req, res, next) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN and new PIN are required'
      });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be exactly 4 digits'
      });
    }

    const user = await User.findById(req.user._id).select('+actionPin');
    const isValid = await user.matchPin(currentPin);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current Action PIN is incorrect'
      });
    }

    user.actionPin = newPin;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Action PIN updated successfully'
    });
  } catch (error) {
    next(error);
  }
};