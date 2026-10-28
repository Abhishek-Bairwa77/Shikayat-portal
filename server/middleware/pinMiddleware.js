import User from '../models/User.js';

// Verify Action PIN for sensitive operations (voting, complaint submission)
export const verifyActionPin = async (req, res, next) => {
  try {
    const { actionPin } = req.body;

    if (!actionPin) {
      return res.status(400).json({
        success: false,
        message: 'Action PIN is required for this operation'
      });
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(actionPin)) {
      return res.status(400).json({
        success: false,
        message: 'Action PIN must be exactly 4 digits'
      });
    }

    // Fetch user with actionPin field
    const user = await User.findById(req.user._id).select('+actionPin');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify PIN
    const isPinValid = await user.matchPin(actionPin);

    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Action PIN. Please try again.'
      });
    }

    next();
  } catch (error) {
    console.error('PIN Verification Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error verifying Action PIN'
    });
  }
};