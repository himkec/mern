import Post from '../models/Post.js';
import User from '../models/User.js';
import path from 'path';

// Create a new post
export const createPost = async (req, res) => {
  try {
    console.log('Creating post with body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user);
    
    const { content = '', media: mediaUrls = [] } = req.body;
    const media = [];

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const fileUrl = `/uploads/${file.filename}`;
        media.push({ url: fileUrl, type: fileType });
      }
    }

    // Add media from URLs if provided
    if (mediaUrls && mediaUrls.length > 0) {
      media.push(...mediaUrls);
    }

    // Validate that either content or media is present
    if (!content && media.length === 0) {
      return res.status(400).json({ 
        message: 'Post must contain either content or media' 
      });
    }

    const post = new Post({
      content,
      media,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all posts with pagination
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      });

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      const newMedia = [];
      for (const file of req.files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const fileUrl = `/uploads/${file.filename}`;
        newMedia.push({ url: fileUrl, type: fileType });
      }
      post.media = [...post.media, ...newMedia];
    }

    post.content = content;
    await post.save();
    await post.populate('author', 'username profilePicture');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete media files
    for (const media of post.media) {
      const filePath = path.join(process.cwd(), media.url);
      // You might want to use fs.unlink to delete the file
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('likes', 'username profilePicture');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content,
      user: req.user._id
    });

    await post.save();
    await post.populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username profilePicture'
      }
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();
    await post.populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username profilePicture'
      }
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 