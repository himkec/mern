import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Image, VideoLibrary, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Array<{ url: string; type: 'image' | 'video' }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('media', files[i]);
      }

      const response = await axios.post(
        'http://localhost:5001/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const newMedia = response.data.urls.map((url: string) => ({
        url,
        type: url.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video',
      }));

      setMedia([...media, ...newMedia]);
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5001/api/posts',
        {
          content,
          media,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setContent('');
      setMedia([]);
      onPostCreated(response.data);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
          <img
            src={user?.profilePicture}
            alt={user?.username}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              marginRight: 16,
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>

        {media.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {media.map((item, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mr: 1,
                  mb: 1,
                }}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt="Uploaded media"
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    style={{
                      maxWidth: 200,
                      maxHeight: 200,
                      borderRadius: 8,
                    }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={() => removeMedia(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <Close sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleMediaUpload}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Image />
        </IconButton>
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <VideoLibrary />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={(!content.trim() && media.length === 0) || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Post'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CreatePost; 