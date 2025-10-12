# ChatBox Client

Giao diện người dùng cho ứng dụng ChatBox được xây dựng với React + TypeScript + Vite + shadcn/ui.

## Tính năng

### 🔐 Xác thực

-   Đăng nhập với username/password
-   Đăng ký tài khoản mới
-   Quản lý session với JWT token
-   Auto-redirect dựa trên trạng thái đăng nhập

### 💬 Chat Real-time

-   Chat trực tiếp (1-1) và nhóm
-   Gửi/nhận tin nhắn real-time với Socket.io
-   Hiển thị trạng thái online/offline
-   Typing indicators
-   Message read receipts
-   Tìm kiếm cuộc hội thoại

### 👥 Quản lý người dùng

-   Tìm kiếm người dùng
-   Tạo cuộc hội thoại mới
-   Thêm/xóa thành viên khỏi nhóm
-   Xem profile người dùng

### 🎨 Giao diện

-   Responsive design
-   Dark/Light mode support (shadcn/ui)
-   Modern UI với Tailwind CSS
-   Accessible components

## Cấu trúc thư mục

```
client/
├── src/
│   ├── api/              # API services
│   │   ├── auth/         # Authentication APIs
│   │   ├── conversation.api.ts
│   │   ├── message.api.ts
│   │   ├── profile.api.ts
│   │   └── socket.ts     # Socket.io service
│   ├── components/       # React components
│   │   ├── auth/         # Login/Register forms
│   │   ├── chat/         # Chat interface
│   │   ├── page/         # Page layouts
│   │   └── ui/           # shadcn/ui components
│   ├── context/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ChatContextSimple.tsx
│   ├── hook/             # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useChat.ts
│   ├── router/           # Route guards
│   └── lib/              # Utilities
└── ...config files
```

## Cài đặt và chạy

1. **Cài đặt dependencies:**

    ```bash
    npm install
    ```

2. **Cấu hình environment:**

    ```bash
    cp .env.example .env
    ```

    Chỉnh sửa `.env`:

    ```
    VITE_API_URL=http://localhost:3000
    ```

3. **Chạy development server:**

    ```bash
    npm run dev
    ```

4. **Build cho production:**
    ```bash
    npm run build
    ```

## API Integration

Client tương tác với server qua REST API và Socket.io:

### REST APIs

-   `POST /auth/login` - Đăng nhập
-   `POST /auth/register` - Đăng ký
-   `GET /profile/me` - Lấy thông tin user hiện tại
-   `GET /conversations` - Lấy danh sách hội thoại
-   `POST /conversations` - Tạo hội thoại mới
-   `GET /messages/conversation/:id` - Lấy tin nhắn
-   `POST /messages` - Gửi tin nhắn
-   `GET /profile/search` - Tìm kiếm user

### Socket.io Events

-   **Client → Server:**
    -   `send_message` - Gửi tin nhắn
    -   `join_conversation` - Tham gia room
    -   `typing_start/stop` - Bắt đầu/dừng typing
-   **Server → Client:**
    -   `new_message` - Tin nhắn mới
    -   `user_typing` - User đang typing
    -   `user_online/offline` - Trạng thái online

## Technologies

-   **React 19** - UI framework
-   **TypeScript** - Type safety
-   **Vite** - Build tool
-   **Tailwind CSS** - Styling
-   **shadcn/ui** - UI component library
-   **React Router** - Routing
-   **Socket.io Client** - Real-time communication

## Deployment

1. Build project:

    ```bash
    npm run build
    ```

2. Serve static files từ thư mục `dist/`

3. Cấu hình server để serve `index.html` cho tất cả routes (SPA)

## Environment Variables

| Variable           | Description     | Default                 |
| ------------------ | --------------- | ----------------------- |
| `VITE_API_URL`     | Backend API URL | `http://localhost:3000` |
| `VITE_APP_NAME`    | App name        | `ChatBox`               |
| `VITE_APP_VERSION` | App version     | `1.0.0`                 |

## Troubleshooting

### Connection Issues

-   Kiểm tra `VITE_API_URL` trong `.env`
-   Đảm bảo server đang chạy
-   Kiểm tra CORS configuration trên server

### Authentication Issues

-   Xóa token cũ: `localStorage.clear()`
-   Kiểm tra JWT token format
-   Verify server authentication endpoints

### Socket Issues

-   Kiểm tra Socket.io server configuration
-   Monitor browser network tab cho WebSocket connections
-   Check console for connection errors
