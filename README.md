# mern
Full stack app using MongoDB, Express.js, React, Node.js


## Project Structure

```
mern/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React source files
├── server/                # Node.js + Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── middleware/      # Custom middleware
└── docker/              # Docker configuration
    └── mongodb/         # MongoDB Docker setup
```

## Technology Stack

### Frontend
- React (Latest version)
- React Router for navigation
- Axios for API calls
- Material-UI for components
- Redux Toolkit for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Express-validator for input validation
- CORS for cross-origin requests

### Database
- MongoDB (containerized with Docker)
- Mongoose ODM


## Development Rules

1. **Code Style**
   - Use ESLint and Prettier for code formatting
   - Follow Airbnb JavaScript style guide
   - Use meaningful variable and function names
   - Write comments for complex logic

2. **Git Workflow**
   - Use feature branches for new features
   - Write descriptive commit messages
   - Create pull requests for code review
   - Keep commits atomic and focused

3. **API Design**
   - RESTful API endpoints
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Implement proper error handling
   - Version API endpoints (e.g., /api/v1/...)

4. **Security**
   - Implement JWT authentication
   - Hash passwords using bcrypt
   - Validate all user inputs
   - Use environment variables for sensitive data
   - Implement rate limiting

5. **Testing**
   - Write unit tests for backend
   - Write component tests for frontend
   - Use Jest for testing
   - Write e2e test using playwright + cucumber
   - Maintain good test coverage

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Add necessary environment variables

4. Start the development servers:
   ```bash
   # Start MongoDB container
   docker-compose up -d

   # Start backend server
   cd server
   npm run dev

   # Start frontend development server
   cd client
   npm start
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern_app
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## Available Scripts

### Backend
- `npm run dev`: Start development server with nodemon
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run lint`: Run ESLint

### Frontend
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run lint`: Run ESLint

