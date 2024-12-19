# Social Media Application

## Overview
This is a full-stack social media application built using **Node.js** for the backend and **React** for the frontend. The application offers a variety of social networking features, including user authentication, post creation, image uploads, commenting, liking, sharing, and a real-time chat system.

---

## Features

### User Management
- **Registration**: New users can register with their email and password.
- **Login**: Secure login with authentication.
- **Profile Management**: Users can update their profile details and view other user profiles.

### Posts
- **Create Post**: Users can create posts with optional image uploads.
- **Delete Post**: Users can delete their own posts.
- **Like Post**: Users can like and unlike posts.
- **Comment**: Users can add, and delete comments on posts.
- **Share Post**: Users can share posts to their profile or other users.

### Chat System
- **Real-Time Chat**: Users can send and receive real-time messages.
- **Message History**: Users can view previous chat messages.

### Additional Features
- **Image Uploads**: Supports uploading images for posts and user profiles.
- **Authentication**: Secure JWT-based authentication.
- **Authorization**: Role-based access control for sensitive actions.

---

## Tech Stack

### Backend
- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for handling routes and middleware.
- **MongoDB**: Database for storing user, post, and message data.
- **Mongoose**: ORM for MongoDB to manage schemas and queries.

### Frontend
- **React**: Frontend library for building user interfaces.
- **Axios**: For making API calls to the backend.
- **pubnub**: For real-time chat functionality.
- **CSS/SCSS**: For styling the application.

---

## Installation and Setup

### Prerequisites
- **Node.js**: Install Node.js (v14 or higher).
- **MongoDB**: Set up a MongoDB instance locally or use a cloud provider.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/social-media-app.git
   ```
2. **Navigate to the project directory**:
   ```bash
   cd social-media-app
   ```
3. **Install dependencies for both backend and frontend**:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
4. **Set up environment variables**:
   Create a `.env` file in the `backend` directory with the following keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   ```
5. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```
6. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   ```

### Deployment
- Use **Heroku** for the backend and **Netlify** or **Vercel** for the frontend.

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in a user.

### Posts
- `POST /api/posts` - Create a new post.
- `GET /api/posts` - Fetch all posts.
- `PUT /api/posts/:id` - Update a post.
- `DELETE /api/posts/:id` - Delete a post.

### Comments
- `POST /api/posts/:id/comments` - Add a comment to a post.
- `DELETE /api/posts/:postId/comments/:commentId` - Delete a comment.

### Likes
- `POST /api/posts/:id/like` - Like a post.
- `POST /api/posts/:id/unlike` - Unlike a post.

### Chat
- `GET /api/chat` - Fetch user chat messages.
- `POST /api/chat` - Send a new chat message.

---

## Contributing
1. Fork the repository.
2. Create a new feature branch.
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes.
   ```bash
   git commit -m "Add your message"
   ```
4. Push your branch.
   ```bash
   git push origin feature-name
   ```
5. Create a Pull Request.

---

## License
This project is licensed under the MIT License.

---

## Contact
For any inquiries or feedback, please contact [abualsout@gmail.com].

