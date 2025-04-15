import { useState, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { getProfilePictureUrl } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  _id: string;
  id?: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  location: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

interface ProfileEditProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onCancel: () => void;
}

export default function ProfileEdit({ profile, onUpdate, onCancel }: ProfileEditProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await axios.put(
        `http://localhost:5001/api/profile/update`,
        {
          username,
          bio,
          location,
          profilePicture
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Call onUpdate with the updated profile data
      onUpdate(response.data);
      
      // Navigate to home page
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(err.response?.data?.message || 'Error updating profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Edit Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          src={getProfilePictureUrl(profilePicture, username)}
          alt={username}
          sx={{ width: 100, height: 100, mr: 3 }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=150`;
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            label="Profile Picture URL"
            value={profilePicture}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setProfilePicture(e.target.value)}
            placeholder="https://example.com/image.jpg"
            helperText="Enter a URL for your profile picture"
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          id="bio"
          label="About Me"
          name="bio"
          multiline
          rows={4}
          value={bio}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          helperText="Write a brief description about yourself"
        />
        <TextField
          fullWidth
          id="location"
          label="Location"
          name="location"
          value={location}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          placeholder="Where are you based?"
        />
      </Box>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            onCancel();
            navigate('/');
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
} 