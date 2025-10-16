# ChatBox - Real-time Chat Application

Web chat real-time sử dụng Socket.IO, React, Node.js và MySQL.

## Tính năng

### Real-time Socket.IO

-   ✅ Gửi/nhận tin nhắn real-time
-   ✅ Typing indicators (đang gõ...)
-   ✅ Online/offline status
-   ✅ Auto join conversation rooms
-   ✅ Message read receipts
-   ✅ Edit/Delete messages real-time

### Chat Features

-   Direct chat (1-1)
-   Group chat
-   Message pagination
-   Last message preview
-   Member management
-   Role-based permissions (admin/member)

### Authentication

-   JWT-based auth
-   Token validation cho Socket.IO
-   Protected routes

## Cấu trúc dự án

```
ChatBox/
├── server/              # Backend Node.js + Express
│   ├── socket/          # Socket.IO handlers
│   ├── controller/      # REST API controllers
│   ├── model/          # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & error handling
│   └── config/         # Database config
│
└── client/             # Frontend React + TypeScript
    ├── src/
    │   ├── components/  # UI components
    │   ├── context/     # Socket & Auth context
    │   ├── api/        # API calls
    │   └── hook/       # Custom hooks
```

## Cài đặt

### 1. Database Setup

```sql
-- Chạy file schema.sql để tạo database
mysql -u root -p < server/schema.sql
```

### 2. Server Setup

```bash
cd server
npm install

# Copy .env.example thành .env và điền thông tin
cp .env.example .env

# Chạy server
npm run dev
```

File `.env` server:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatbox
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Client Setup

```bash
cd client
npm install

# Copy .env.example thành .env
cp .env.example .env

# Chạy client
npm run dev
```

File `.env` client:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Socket.IO Events

### Client emit:

-   `join_conversation` - Join vào conversation room
-   `leave_conversation` - Leave conversation room
-   `send_message` - Gửi tin nhắn
-   `edit_message` - Sửa tin nhắn
-   `delete_message` - Xóa tin nhắn
-   `mark_message_read` - Đánh dấu đã đọc
-   `typing_start` - Bắt đầu gõ
-   `typing_stop` - Ngừng gõ
-   `create_conversation` - Tạo conversation mới
-   `get_online_users` - Lấy danh sách online

### Server emit:

-   `new_message` - Tin nhắn mới
-   `message_edited` - Tin nhắn đã sửa
-   `message_deleted` - Tin nhắn đã xóa
-   `message_read` - Tin nhắn đã đọc
-   `user_typing` - User đang gõ
-   `user_stop_typing` - User ngừng gõ
-   `user_online` - User online
-   `user_offline` - User offline
-   `online_users` - Danh sách user online
-   `conversation_created` - Conversation mới
-   `joined_conversation` - Đã join conversation
-   `error` - Lỗi

## API Endpoints

### Auth

-   `POST /auth/register` - Đăng ký
-   `POST /auth/login` - Đăng nhập

### Conversations

-   `GET /conversations` - Lấy danh sách conversations
-   `GET /conversations/:id` - Chi tiết conversation
-   `POST /conversations` - Tạo conversation mới
-   `PUT /conversations/:id` - Cập nhật conversation
-   `DELETE /conversations/:id` - Xóa conversation
-   `POST /conversations/:id/members` - Thêm member
-   `DELETE /conversations/:id/members/:memberId` - Xóa member

### Messages

-   `GET /messages/conversation/:id` - Lấy messages
-   `POST /messages` - Gửi message (backup, dùng socket)
-   `GET /messages/:id` - Chi tiết message
-   `PUT /messages/:id` - Sửa message
-   `DELETE /messages/:id` - Xóa message
-   `POST /messages/:id/read` - Đánh dấu đã đọc

### Profile

-   `GET /profile` - Thông tin user
-   `PUT /profile` - Cập nhật profile

## Tech Stack

### Backend

-   Node.js + Express
-   Socket.IO
-   MySQL + mysql2
-   JWT authentication
-   bcrypt

### Frontend

-   React + TypeScript
-   Vite
-   Socket.IO Client
-   Tailwind CSS + shadcn/ui
-   React Router

## Flow hoạt động

1. User login → nhận JWT token
2. Client kết nối Socket.IO với token
3. Server xác thực token → emit `online_users`
4. Client join các conversation rooms
5. Gửi tin nhắn qua socket → server broadcast cho room
6. Client lắng nghe events qua CustomEvent
7. UI tự động update real-time

## Lưu ý

-   Socket.IO auto reconnect khi mất kết nối
-   Tin nhắn được lưu vào database trước khi broadcast
-   Chỉ members mới join được conversation rooms
-   Typing indicators tự động clear sau 1s
-   Messages sort theo thời gian tăng dần
-   Optimistic UI updates với CustomEvent pattern
