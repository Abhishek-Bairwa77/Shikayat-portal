import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  actionPin: {
    type: String,
    required: [true, 'Action PIN is required'],
    select: false
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'OTHER']
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty'],
    default: 'student'
  },
  deviceToken: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password and PIN before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') && !this.isModified('actionPin')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('actionPin')) {
    this.actionPin = await bcrypt.hash(this.actionPin, salt);
  }

  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare Action PIN method
userSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.actionPin);
};

const User = mongoose.model('User', userSchema);

export default User;