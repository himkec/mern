import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  profilePicture: string;
}

interface FollowersListProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  title: string;
}

const FollowersList: React.FC<FollowersListProps> = ({ open, onClose, users, title }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {users.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No {title.toLowerCase()} yet
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            users.map((user) => (
              <ListItem
                key={user._id}
                component="div"
                onClick={() => handleUserClick(user._id)}
                sx={{ 
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profilePicture} alt={user.username} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersList; 