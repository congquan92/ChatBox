# ChatBox API Documentation

Hệ thống chat real-time với REST API và Socket.IO

## 🚀 Cài đặt và chạy

```bash
cd server
npm install
npm run dev
```

## 🔧 Cấu hình (.env)

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatbox
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 📊 Database Schema

Schema đã có sẵn trong `schema.sql`:

-   `users`: Thông tin người dùng
-   `conversations`: Cuộc trò chuyện (1-1 hoặc group)
-   `conversation_members`: Thành viên trong cuộc trò chuyện
-   `messages`: Tin nhắn
-   `message_receipts`: Trạng thái đã đọc tin nhắn

## 🔐 Authentication

Tất cả API yêu cầu xác thực (trừ register/login) cần header:

```
Authorization: Bearer <jwt_token>
```

## 📡 REST API Endpoints

### Authentication

-   `POST /auth/register` - Đăng ký tài khoản
-   `POST /auth/login` - Đăng nhập

### Profile

-   `GET /profile/me` - Lấy thông tin profile
-   `PUT /profile/me` - Cập nhật profile

### Conversations

-   `GET /conversations` - Lấy danh sách cuộc trò chuyện
-   `POST /conversations` - Tạo cuộc trò chuyện mới
-   `GET /conversations/:id` - Lấy thông tin chi tiết cuộc trò chuyện
-   `PUT /conversations/:id` - Cập nhật thông tin cuộc trò chuyện
-   `POST /conversations/:id/members` - Thêm thành viên
-   `DELETE /conversations/:id/members/:memberId` - Xóa thành viên
-   `POST /conversations/:id/leave` - Rời cuộc trò chuyện
-   `GET /conversations/search/users` - Tìm kiếm user để thêm vào conversation

### Messages

-   `POST /messages` - Gửi tin nhắn mới
-   `GET /messages/conversation/:conversationId` - Lấy tin nhắn trong cuộc trò chuyện
-   `GET /messages/:messageId` - Lấy chi tiết tin nhắn
-   `PUT /messages/:messageId` - Chỉnh sửa tin nhắn
-   `DELETE /messages/:messageId` - Xóa tin nhắn
-   `POST /messages/:messageId/read` - Đánh dấu tin nhắn đã đọc
-   `POST /messages/conversation/:conversationId/read-all` - Đánh dấu tất cả đã đọc
-   `GET /messages/conversation/:conversationId/unread-count` - Số tin nhắn chưa đọc
-   `GET /messages/conversation/:conversationId/search` - Tìm kiếm tin nhắn

### Health Check

-   `GET /health` - Kiểm tra trạng thái server

## 🔌 Socket.IO Events

### Connection

Kết nối với JWT authentication:

```javascript
const socket = io("http://localhost:3000", {
    auth: {
        token: "your_jwt_token",
    },
});
```

### Events Client → Server

#### Conversation Management

-   `join_conversation` - Tham gia room conversation

    ```javascript
    socket.emit("join_conversation", { conversationId: 1 });
    ```

-   `leave_conversation` - Rời room conversation

    ```javascript
    socket.emit("leave_conversation", { conversationId: 1 });
    ```

-   `create_conversation` - Tạo conversation mới
    ```javascript
    socket.emit("create_conversation", {
        type: "group",
        title: "Group Name",
        memberIds: [2, 3, 4],
        label: "Team",
    });
    ```

#### Messaging

-   `send_message` - Gửi tin nhắn

    ```javascript
    socket.emit("send_message", {
        conversationId: 1,
        content: "Hello!",
        contentType: "text",
    });
    ```

-   `mark_message_read` - Đánh dấu đã đọc
    ```javascript
    socket.emit("mark_message_read", { messageId: 123 });
    ```

#### Typing Indicators

-   `typing_start` - Bắt đầu typing

    ```javascript
    socket.emit("typing_start", { conversationId: 1 });
    ```

-   `typing_stop` - Dừng typing
    ```javascript
    socket.emit("typing_stop", { conversationId: 1 });
    ```

#### Online Status

-   `get_online_users` - Lấy danh sách user online
    ```javascript
    socket.emit("get_online_users");
    ```

### Events Server → Client

#### Connection Status

-   `user_online` - User đăng nhập
-   `user_offline` - User đăng xuất
-   `online_users` - Danh sách user online

#### Conversation Events

-   `joined_conversation` - Đã tham gia conversation
-   `left_conversation` - Đã rời conversation
-   `new_conversation` - Có conversation mới
-   `member_joined` - Có thành viên mới
-   `member_left` - Thành viên rời đi

#### Message Events

-   `new_message` - Tin nhắn mới
-   `message_read` - Tin nhắn đã được đọc

#### Typing Events

-   `user_typing` - User đang typing
-   `user_stop_typing` - User ngừng typing

#### Error Events

-   `error` - Lỗi xảy ra

## 📝 Ví dụ sử dụng

### 1. Đăng ký và đăng nhập

```javascript
// Đăng ký
const registerData = {
    username: "john_doe",
    password: "password123",
    email: "john@example.com",
    displayName: "John Doe",
};

fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
});

// Đăng nhập
const loginData = {
    username: "john_doe",
    password: "password123",
};

const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
});

const { token } = await response.json();
```

### 2. Tạo conversation và gửi tin nhắn

```javascript
// Tạo conversation mới
const conversationData = {
    type: "group",
    title: "Team Meeting",
    memberIds: [2, 3, 4],
    label: "Work",
};

const response = await fetch("/conversations", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(conversationData),
});

const {
    data: { conversationId },
} = await response.json();

// Join conversation qua socket
socket.emit("join_conversation", { conversationId });

// Gửi tin nhắn
socket.emit("send_message", {
    conversationId,
    content: "Hello everyone!",
    contentType: "text",
});
```

### 3. Lắng nghe tin nhắn mới

```javascript
socket.on("new_message", (message) => {
    console.log("New message:", message);
    // {
    //   id: 123,
    //   conversationId: 1,
    //   senderId: 2,
    //   content: 'Hello!',
    //   contentType: 'text',
    //   createdAt: '2024-01-01T12:00:00.000Z',
    //   sender: {
    //     username: 'john_doe',
    //     displayName: 'John Doe'
    //   }
    // }
});
```

## 🎯 Tính năng chính

✅ **Authentication & Authorization**

-   JWT-based authentication
-   Middleware bảo vệ routes

✅ **Real-time Communication**

-   Socket.IO cho real-time messaging
-   Online/offline status
-   Typing indicators

✅ **Conversation Management**

-   Direct (1-1) và Group chat
-   Thêm/xóa members
-   Admin permissions

✅ **Message Features**

-   Gửi/nhận tin nhắn
-   Chỉnh sửa/xóa tin nhắn
-   Read receipts
-   Tìm kiếm tin nhắn

✅ **User Experience**

-   Profile management
-   User search
-   Unread message counts

## 🔒 Security Features

-   JWT token authentication
-   Socket.IO authentication middleware
-   SQL injection protection (parameterized queries)
-   Password hashing với bcrypt
-   Input validation
-   Error handling

## 🛠️ Technology Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MySQL
-   **Real-time**: Socket.IO
-   **Authentication**: JWT
-   **Password Hashing**: bcryptjs

Hệ thống đã sẵn sàng cho việc phát triển client-side và triển khai production!
