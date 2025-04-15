import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { LocationOn, Edit } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { getProfilePictureUrl } from '../../utils/imageUtils';
import ProfileEdit from './ProfileEdit.tsx';
import { User } from '../../types/user';

interface UserProfile extends Omit<User, 'profilePicture' | 'bio' | 'location' | 'followers' | 'following' | 'createdAt'> {
  profilePicture: string;
  bio: string;
  location: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!userId) {
          setError('User ID is required');
          return;
        }
        console.log('Fetching profile for userId:', userId);
        const response = await axios.get(`http://localhost:5001/api/profile/${userId}`);
        console.log('Profile data:', response.data);
        setProfile(response.data);
        
        // Check if current user is following this profile
        if (currentUser && currentUser._id !== userId) {
          setIsFollowing(currentUser.following?.includes(userId) || false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  // Set isEditing to true by default for own profile
  useEffect(() => {
    if (profile && currentUser) {
      console.log('Current user:', currentUser);
      console.log('Profile:', profile);
      const isOwnProfile = currentUser._id === profile._id;
      console.log('Is own profile:', isOwnProfile);
      setIsEditing(isOwnProfile);
    }
  }, [profile, currentUser]);

  const handleFollow = async () => {
    try {
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (isFollowing) {
        await axios.post(
          `http://localhost:5001/api/profile/unfollow/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:5001/api/profile/follow/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsFollowing(!isFollowing);
      
      // Refresh profile data
      const response = await axios.get(`http://localhost:5001/api/profile/${userId}`);
      setProfile(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating follow status');
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Profile not found</Typography>
      </Box>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profile._id;
  console.log('Final isOwnProfile check:', isOwnProfile);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {isOwnProfile ? (
          <ProfileEdit 
            profile={profile} 
            onUpdate={handleProfileUpdate} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={getProfilePictureUrl(profile.profilePicture, profile.username)}
                alt={profile.username}
                sx={{ width: 100, height: 100, mr: 3 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random&color=fff&size=150`;
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="h1">
                  {profile.username}
                </Typography>
                {profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{profile.location}</Typography>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>{profile.followers.length}</strong> followers • <strong>{profile.following.length}</strong> following
                  </Typography>
                </Box>
              </Box>
              {isOwnProfile ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {profile.bio || "No bio provided"}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 