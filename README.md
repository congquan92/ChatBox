# ChatBox - Real-time Web Chat Application

Một ứng dụng chat real-time được xây dựng với Node.js (Express + Socket.io) cho backend và React (TypeScript + Vite) cho frontend.

## 🚀 Tính năng

### Backend Features

-   ✅ Authentication với JWT
-   ✅ Real-time messaging với Socket.io
-   ✅ Group chat và direct messaging
-   ✅ Message management (send, edit, delete)
-   ✅ Read receipts
-   ✅ Typing indicators
-   ✅ Online/offline status
-   ✅ User profile management
-   ✅ MySQL database integration

### Frontend Features

-   ✅ Responsive UI với Tailwind CSS + Radix UI
-   ✅ Real-time chat interface
-   ✅ User authentication (login/register)
-   ✅ Conversation management
-   ✅ Message composition với typing indicators
-   ✅ Online users display
-   ✅ Search functionality
-   ✅ Modern React patterns (hooks, context)

## 🛠️ Tech Stack

### Backend

-   Node.js + Express.js
-   Socket.io cho real-time communication
-   MySQL + mysql2
-   JWT cho authentication
-   bcrypt cho password hashing
-   CORS middleware

### Frontend

-   React 19 + TypeScript
-   Vite build tool
-   Tailwind CSS + Radix UI components
-   Socket.io client
-   React Router cho navigation
-   Context API cho state management

## 📋 Prerequisites

-   Node.js (version 16+)
-   MySQL database
-   npm hoặc yarn

## ⚙️ Setup Instructions

### 1. Database Setup

Tạo database MySQL và chạy schema:

\`\`\`sql
CREATE DATABASE chatbox_db;
USE chatbox_db;

-- Copy và paste nội dung từ server/schema.sql
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd server
npm install

# Cấu hình environment variables

cp .env.example .env

# Chỉnh sửa .env với thông tin database và JWT secret

# Start server

npm run dev
\`\`\`

Backend sẽ chạy tại `http://localhost:3000`

### 3. Frontend Setup

\`\`\`bash
cd client
npm install

# Cấu hình environment variables

cp .env.example .env

# Đảm bảo VITE_API_URL và VITE_SOCKET_URL trỏ đến backend

# Start development server

npm run dev
\`\`\`

Frontend sẽ chạy tại `http://localhost:5173`

## 📡 API Documentation

Chi tiết API endpoints có thể xem tại [server/API_DOCS.md](./server/API_DOCS.md)

### Authentication Endpoints

-   `POST /auth/register` - Đăng ký user mới
-   `POST /auth/login` - Đăng nhập

### Profile Endpoints

-   `GET /profile/me` - Lấy profile hiện tại
-   `PUT /profile/me` - Cập nhật profile
-   `GET /profile/search` - Tìm kiếm users
-   `GET /profile/users` - Lấy danh sách users

### Conversation Endpoints

-   `GET /conversations` - Lấy conversations của user
-   `POST /conversations` - Tạo conversation mới
-   `GET /conversations/:id` - Chi tiết conversation
-   `PUT /conversations/:id` - Cập nhật conversation
-   `DELETE /conversations/:id` - Xóa conversation

### Message Endpoints

-   `GET /messages/conversation/:id` - Lấy messages
-   `POST /messages` - Gửi message mới
-   `PUT /messages/:id` - Chỉnh sửa message
-   `DELETE /messages/:id` - Xóa message

## 🔌 Socket.io Events

### Client Events (gửi đến server)

-   `send_message` - Gửi tin nhắn
-   `edit_message` - Chỉnh sửa tin nhắn
-   `delete_message` - Xóa tin nhắn
-   `mark_message_read` - Đánh dấu đã đọc
-   `create_conversation` - Tạo conversation
-   `join_conversation` - Join conversation room
-   `typing_start` - Bắt đầu gõ
-   `typing_stop` - Ngừng gõ
-   `get_online_users` - Lấy users online

### Server Events (nhận từ server)

-   `new_message` - Tin nhắn mới
-   `message_edited` - Tin nhắn đã sửa
-   `message_deleted` - Tin nhắn đã xóa
-   `message_read` - Tin nhắn đã đọc
-   `conversation_created` - Conversation mới
-   `user_typing` - User đang gõ
-   `user_stop_typing` - User ngừng gõ
-   `user_online` - User online
-   `user_offline` - User offline
-   `online_users` - Danh sách users online

## 🏗️ Kiến trúc

### Backend Architecture

\`\`\`
server/
├── config/ # Database configuration
├── controller/ # Request handlers
├── middleware/ # Express middlewares
├── model/ # Database models
├── routes/ # API routes
├── socket/ # Socket.io handlers
└── index.js # Entry point
\`\`\`

### Frontend Architecture

\`\`\`
client/src/
├── api/ # API service functions
├── components/ # React components
│ ├── auth/ # Authentication components
│ ├── chat/ # Chat components
│ ├── page/ # Page components
│ └── ui/ # Reusable UI components
├── context/ # React context providers
├── hook/ # Custom hooks
├── lib/ # Utilities
└── router/ # Route guards
\`\`\`

## 🔧 Development

### Backend Development

\`\`\`bash
cd server
npm run dev # Chạy với nodemon auto-reload
\`\`\`

### Frontend Development

\`\`\`bash
cd client
npm run dev # Vite dev server với HMR
\`\`\`

### Build cho Production

\`\`\`bash

# Frontend

cd client
npm run build

# Backend (production ready)

cd server
npm start
\`\`\`

## 🚀 Deployment

### Environment Variables

**Server (.env):**
\`\`\`env
PORT=3000
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=chatbox_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
\`\`\`

**Client (.env):**
\`\`\`env
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
\`\`\`

## 🔍 Features Overview

### 1. Authentication System

-   User registration với validation
-   JWT token authentication
-   Protected routes
-   Auto logout khi token expired

### 2. Real-time Chat

-   Instant messaging với Socket.io
-   Group chat và direct messaging
-   Message editing và deletion
-   Read receipts
-   Typing indicators

### 3. User Management

-   Profile management
-   User search
-   Online status tracking
-   Avatar support

### 4. Modern UI/UX

-   Responsive design
-   Dark/light theme support (với Radix UI)
-   Loading states
-   Error handling
-   Optimistic updates

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

    - Kiểm tra MySQL đã chạy
    - Verify thông tin database trong .env
    - Đảm bảo đã tạo database và tables

2. **Socket Connection Failed**

    - Kiểm tra CORS settings
    - Verify socket URL trong client .env
    - Check firewall/network settings

3. **JWT Token Issues**
    - Kiểm tra JWT_SECRET trong server .env
    - Clear localStorage trong browser
    - Check token expiration time

## 📝 Todo / Future Enhancements

-   [ ] File upload/sharing
-   [ ] Voice/video calling
-   [ ] Push notifications
-   [ ] Message encryption
-   [ ] Admin panel
-   [ ] User roles & permissions
-   [ ] Message search
-   [ ] Emoji reactions
-   [ ] Message forwarding
-   [ ] Docker deployment
-   [ ] Redis for session management
-   [ ] Rate limiting
-   [ ] Automated testing

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Happy Chatting! 🎉**
