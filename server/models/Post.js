import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: function() {
      // Content is required only if there's no media
      return !this.media || this.media.length === 0;
    },
    maxlength: 280
  },
  media: {
    type: [{
      url: String,
      type: {
        type: String,
        enum: ['image', 'video']
      }
    }],
    default: []
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add text index for search functionality
postSchema.index({ content: 'text' });

const Post = mongoose.model('Post', postSchema);

export default Post; 