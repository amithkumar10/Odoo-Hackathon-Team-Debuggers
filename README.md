# StackIt - Complete StackOverflow Clone

A full-stack StackOverflow clone built with React.js, Node.js, Express.js, and MongoDB. Features complete Q&A functionality, user authentication, voting system, tagging, notifications, and admin panel.

## 🛠️ Tech Stack

**Frontend:**
- React.js (No TypeScript)
- Tailwind CSS
- React Router DOM
- React Quill (Rich Text Editor)
- React Select (Tag Input)
- Axios (API calls)
- React Hot Toast (Notifications)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- BCrypt (Password hashing)
- Express Validator

## 📁 Project Structure

```
StackIt/
├── client/              # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Utility functions
│   └── package.json
├── server/              # Backend (Node + Express)
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, validation, error handling
│   ├── config/          # Database connection
│   ├── utils/           # Helper functions
│   └── index.js         # Entry point
└── package.json
```

## ✅ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with HttpOnly cookies
- User registration and login
- Role-based access control (User, Admin)
- Protected routes

### 📝 Question & Answer System
- Ask questions with rich text editor
- Post answers with formatting support
- Accept answers (question author only)
- Edit and delete own content

### 🗳️ Voting System
- Upvote/downvote questions and answers
- Real-time vote score updates
- Prevent self-voting

### 🏷️ Tagging System
- Multi-select tag input with search
- Create new tags dynamically
- Filter questions by tags
- Tag management

### 🔔 Notification System
- Real-time notifications for:
  - New answers to your questions
  - Comments on your answers
  - User mentions (@username)
  - Admin announcements
- Unread notification counter
- Mark as read functionality

### 🎨 Rich Text Editor
- Bold, Italic, Strikethrough formatting
- Bullet points and numbered lists
- Hyperlink insertion
- Image upload support
- Text alignment options
- Code blocks and syntax highlighting

### 👨‍💼 Admin Features
- User management (ban/unban users)
- Content moderation
- Platform statistics dashboard
- Broadcast announcements
- Generate reports

### 📱 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface
- Modern UI with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd stackit
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Set up environment variables**

Create `server/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/stackit
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Start the development servers**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

6. **Seed sample data (optional)**
```bash
npm run seed
```

## 📊 Demo Accounts

After seeding, you can use these demo accounts:

**Admin Account:**
- Email: admin@stackit.com
- Password: admin123

**Regular User:**
- Email: john@example.com
- Password: password123

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `POST /api/answers/questions/:questionId/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban user
- `PUT /api/admin/users/:id/unban` - Unban user

## 🎯 Key Features Implemented

### Rich Text Editor
- Uses React Quill for WYSIWYG editing
- Custom toolbar with essential formatting options
- Support for code blocks, links, and images
- Clean HTML output

### Voting System
- Real-time vote updates
- Prevents duplicate voting
- Visual feedback for vote state
- Score calculation and display

### Tag System
- Dynamic tag creation
- Auto-complete search
- Color-coded tags
- Tag-based filtering

### Notification System
- Real-time updates
- Multiple notification types
- Unread counter in navbar
- Dropdown interface with actions

### Admin Panel
- Comprehensive dashboard
- User management tools
- Platform statistics
- Announcement system

## 🔒 Security Features

- JWT tokens stored in HttpOnly cookies
- Password hashing with BCrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- SQL injection prevention with Mongoose

## 📱 Responsive Design

- Mobile-first CSS approach
- Optimized touch interactions
- Collapsible navigation
- Responsive data tables
- Adaptive layouts for all screen sizes

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by StackOverflow's design and functionality
- Built with modern web development best practices
- Uses industry-standard security implementations

---

**StackIt** - Empowering developers to share knowledge and build together! 🚀