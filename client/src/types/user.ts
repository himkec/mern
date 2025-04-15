export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  followers?: string[];
  following?: string[];
  createdAt?: string;
} 