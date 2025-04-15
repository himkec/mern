import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { getProfilePictureUrl } from '../../utils/imageUtils';

interface UserProfile {
  _id: string;
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
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        'http://localhost:5001/api/profile/update',
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
      
      onUpdate(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
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
        <TextField
          fullWidth
          label="Profile Picture URL"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
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