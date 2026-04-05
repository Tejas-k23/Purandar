import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 200,
      required: true,
    },
  },
  { timestamps: true },
);

feedbackSchema.index({ project: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
