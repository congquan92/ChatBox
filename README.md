# ChatBox - Ứng dụng Chat Real-time

Ứng dụng chat real-time được xây dựng với React, TypeScript, Socket.io và Node.js.

## Tính năng

-   ✅ Đăng ký/Đăng nhập tài khoản
-   ✅ Chat real-time với Socket.io
-   ✅ Tạo cuộc trò chuyện riêng tư và nhóm
-   ✅ Hiển thị trạng thái online/offline
-   ✅ Typing indicator (đang nhập...)
-   ✅ Responsive design với Tailwind CSS
-   ✅ Dark/Light mode support

## Cấu trúc dự án

```
ChatBox/
├── client/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth, Socket)
│   │   ├── hooks/       # Custom hooks
│   │   ├── api/         # API calls
│   │   ├── lib/         # Utilities
│   │   └── assets/      # Static assets
│   └── public/
└── server/          # Backend Node.js + Express
    ├── controller/  # Controllers
    ├── model/       # Database models
    ├── routes/      # API routes
    ├── socket/      # Socket.io handlers
    ├── middleware/  # Middlewares
    └── config/      # Database config
```

## Công nghệ sử dụng

### Frontend

-   **React 19** - UI Framework
-   **TypeScript** - Type safety
-   **Tailwind CSS** - Styling
-   **Socket.io Client** - Real-time communication
-   **React Router** - Navigation
-   **Vite** - Build tool

### Backend

-   **Node.js** - Runtime
-   **Express** - Web framework
-   **Socket.io** - Real-time communication
-   **MySQL** - Database
-   **JWT** - Authentication
-   **bcrypt** - Password hashing

## Cài đặt và chạy

### Yêu cầu

-   Node.js 18+
-   MySQL 8+
-   npm hoặc yarn

### 1. Clone repository

```bash
git clone <repository-url>
cd ChatBox
```

### 2. Cài đặt dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

### 3. Cấu hình Database

1. Tạo database MySQL:

```sql
CREATE DATABASE chatbox;
```

2. Import schema:

```bash
cd server
mysql -u username -p chatbox < schema.sql
```

3. Tạo file `.env` trong thư mục `server`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=chatbox
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Cấu hình Frontend

Tạo file `.env` trong thư mục `client` (đã có sẵn):

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 5. Chạy ứng dụng

#### Backend (Terminal 1)

```bash
cd server
npm run dev
```

#### Frontend (Terminal 2)

```bash
cd client
npm run dev
```

Ứng dụng sẽ chạy tại:

-   Frontend: http://localhost:5173
-   Backend API: http://localhost:3000

## API Endpoints

### Authentication

-   `POST /auth/register` - Đăng ký tài khoản
-   `POST /auth/login` - Đăng nhập

### Conversations

-   `GET /conversations` - Lấy danh sách cuộc trò chuyện
-   `POST /conversations` - Tạo cuộc trò chuyện mới
-   `GET /conversations/:id` - Lấy chi tiết cuộc trò chuyện
-   `GET /conversations/search/users` - Tìm kiếm user

### Messages

-   `GET /messages/conversation/:id` - Lấy tin nhắn trong cuộc trò chuyện
-   `POST /messages` - Gửi tin nhắn mới
-   `PUT /messages/:id` - Chỉnh sửa tin nhắn
-   `DELETE /messages/:id` - Xóa tin nhắn

## Socket Events

### Client gửi

-   `join_conversation` - Join vào conversation room
-   `leave_conversation` - Rời khỏi conversation room
-   `send_message` - Gửi tin nhắn
-   `typing_start` - Bắt đầu nhập
-   `typing_stop` - Dừng nhập
-   `get_online_users` - Lấy danh sách user online

### Server gửi

-   `new_message` - Tin nhắn mới
-   `user_typing` - User đang nhập
-   `user_stop_typing` - User dừng nhập
-   `user_online` - User online
-   `user_offline` - User offline
-   `online_users` - Danh sách user online

## Cấu trúc Components

### Authentication

-   `Login` - Form đăng nhập
-   `Register` - Form đăng ký

### Chat

-   `ChatInterface` - Layout chính của chat
-   `ConversationList` - Danh sách cuộc trò chuyện
-   `ChatWindow` - Cửa sổ chat chính
-   `MessageBubble` - Bubble tin nhắn
-   `NewConversationModal` - Modal tạo cuộc trò chuyện mới
-   `OnlineUsers` - Hiển thị user online

### Contexts

-   `AuthContext` - Quản lý authentication state
-   `SocketContext` - Quản lý socket connection

## Tính năng nâng cao có thể thêm

-   [ ] Upload file/hình ảnh
-   [ ] Emoji picker
-   [ ] Message reactions
-   [ ] Push notifications
-   [ ] Voice/Video call
-   [ ] Message search
-   [ ] Message threading
-   [ ] User presence (away, busy, etc.)
-   [ ] Message encryption

## Troubleshooting

### Lỗi kết nối database

1. Kiểm tra MySQL service đang chạy
2. Kiểm tra thông tin kết nối trong `.env`
3. Đảm bảo database đã được tạo

### Lỗi CORS

1. Kiểm tra cấu hình CORS trong `server/index.js`
2. Đảm bảo URL frontend đúng

### Socket không kết nối

1. Kiểm tra `VITE_SOCKET_URL` trong client `.env`
2. Kiểm tra backend server đang chạy
3. Kiểm tra firewall/antivirus

## Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
