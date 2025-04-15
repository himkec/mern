import {
  Container,
  Box,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  Paper,
  Grid,
  InputBase,
  alpha,
  Menu,
  MenuItem
} from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Feed from '../post/Feed';
import FollowersList from '../profile/FollowersList';

interface Profile {
  _id: string;
  username: string;
  profilePicture: string;
  bio: string;
  location: string;
  followers: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
  following: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        // Fetch complete user data for followers and following
        const followersPromises = data.followers.map(async (followerId: string) => {
          const followerResponse = await fetch(`http://localhost:5001/api/profile/${followerId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return followerResponse.json();
        });
        
        const followingPromises = data.following.map(async (followingId: string) => {
          const followingResponse = await fetch(`http://localhost:5001/api/profile/${followingId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return followingResponse.json();
        });
        
        const [followers, following] = await Promise.all([
          Promise.all(followersPromises),
          Promise.all(followingPromises)
        ]);
        
        setProfile({
          ...data,
          followers,
          following
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleShowFollowers = () => {
    setShowFollowers(true);
    handleMenuClose();
  };

  const handleShowFollowing = () => {
    setShowFollowing(true);
    handleMenuClose();
  };

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5001/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      handleSearch({ target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleShowFollowers}>
              Followers ({profile?.followers.length || 0})
            </MenuItem>
            <MenuItem onClick={handleShowFollowing}>
              Following ({profile?.following.length || 0})
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', mr: 2 }}>
            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 300,
                bgcolor: alpha('#fff', 0.15),
                '&:hover': {
                  bgcolor: alpha('#fff', 0.25),
                },
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, color: 'white' }}
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <IconButton type="submit" sx={{ p: '10px', color: 'white' }}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>

          {searchResults.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: 64,
                right: 16,
                width: 300,
                maxHeight: 400,
                overflow: 'auto',
                zIndex: 1000,
                mt: 1,
                boxShadow: 3,
              }}
            >
              {searchResults.map((result) => (
                <Box
                  key={result._id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => {
                    navigate(`/profile/${result._id}`);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  <Avatar
                    src={result.profilePicture}
                    alt={result.username}
                    sx={{ mr: 2 }}
                  />
                  <Typography>{result.username}</Typography>
                </Box>
              ))}
            </Paper>
          )}

          <IconButton
            onClick={() => navigate(`/profile/${user?._id}`)}
            sx={{ ml: 2 }}
          >
            <Avatar
              src={user?.profilePicture}
              alt={user?.username}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2
              }}
            >
              <Avatar
                src={profile?.profilePicture}
                alt={profile?.username}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" component="h1" gutterBottom>
                {profile?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.bio || 'No bio yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.location || 'No location set'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{profile?.followers.length || 0}</strong> followers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{profile?.following.length || 0}</strong> following
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Feed />
          </Grid>
        </Grid>
      </Container>

      <FollowersList
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        users={(profile?.followers || []).filter(user => user && user._id)}
        title="Followers"
      />

      <FollowersList
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        users={(profile?.following || []).filter(user => user && user._id)}
        title="Following"
      />
    </Box>
  );
} 