import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Avatar,
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface PostProps {
  post: {
    _id: string;
    content: string;
    media: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    author: {
      _id: string;
      username: string;
      profilePicture: string;
    };
    likes: Array<{
      _id: string;
      username: string;
      profilePicture: string;
    }>;
    comments: Array<{
      _id: string;
      content: string;
      user: {
        _id: string;
        username: string;
        profilePicture: string;
      };
      createdAt: string;
    }>;
    createdAt: string;
  };
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, updatedPost: any) => void;
}

const Post: React.FC<PostProps> = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLiked, setIsLiked] = useState(
    post.likes.some((like) => like._id === user?._id)
  );

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5001/api/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsLiked(!isLiked);
      onUpdate(post._id, response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5001/api/posts/${post._id}/comments`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setComment('');
      onUpdate(post._id, response.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:5001/api/posts/${post._id}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      onUpdate(post._id, response.data);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/posts/${post._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      onDelete(post._id);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/posts/${post._id}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setIsEditing(false);
      onUpdate(post._id, response.data);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const isAuthor = user?._id === post.author._id;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={post.author.profilePicture}
            alt={post.author.username}
            sx={{ mr: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{post.author.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          {isAuthor && (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setIsEditing(true);
                    setAnchorEl(null);
                  }}
                >
                  <Edit sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleDeletePost();
                    setAnchorEl(null);
                  }}
                >
                  <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {isEditing ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleUpdatePost}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {post.content}
            </Typography>
            {post.media && post.media.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {post.media.map((media, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt="Post media"
                        style={{ maxWidth: '100%', borderRadius: 8 }}
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        style={{ maxWidth: '100%', borderRadius: 8 }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </CardContent>

      <CardActions disableSpacing>
        <IconButton onClick={handleLike}>
          {isLiked ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {post.likes.length} likes
        </Typography>
        <IconButton onClick={() => setShowComments(!showComments)}>
          <Comment />
        </IconButton>
        <Typography variant="body2">
          {post.comments.length} comments
        </Typography>
      </CardActions>

      {showComments && (
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleComment}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!comment.trim()}
            >
              Comment
            </Button>
          </form>

          <Box sx={{ mt: 2 }}>
            {post.comments.map((comment) => (
              <Box
                key={comment._id}
                sx={{
                  display: 'flex',
                  alignItems: 'start',
                  mb: 2,
                }}
              >
                <Avatar
                  src={comment.user.profilePicture}
                  alt={comment.user.username}
                  sx={{ mr: 1, width: 32, height: 32 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {comment.user.username}
                  </Typography>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </Typography>
                </Box>
                {user?._id === comment.user._id && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Post; 