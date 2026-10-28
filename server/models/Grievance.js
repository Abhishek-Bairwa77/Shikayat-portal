import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Hostel', 'Academics', 'Infrastructure', 'Mess', 'Sports', 'Library', 'Other']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['General', 'Harassment', 'Ragging', 'Discrimination', 'Safety', 'Other']
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['submitted', 'in-review', 'in-progress', 'resolved'],
    default: 'submitted'
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  isEscalated: {
    type: Boolean,
    default: false
  },
  isHighPriority: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  officialRemarks: {
    type: String,
    default: ''
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    remarks: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast sorting
grievanceSchema.index({ voteCount: -1 });
grievanceSchema.index({ department: 1 });
grievanceSchema.index({ isConfidential: 1 });
grievanceSchema.index({ status: 1 });

// Update timestamp on save
grievanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for display - hides reporter identity publicly
grievanceSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.isConfidential ? '[Confidential]' : this.description,
    department: this.department,
    category: this.isConfidential ? 'Confidential' : this.category,
    voteCount: this.voteCount,
    status: this.status,
    isHighPriority: this.isHighPriority,
    officialRemarks: this.officialRemarks,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;