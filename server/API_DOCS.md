# ChatBox API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Tất cả các API (trừ auth) đều cần header:

```
Authorization: Bearer <token>
```

## Auth Routes

### POST /auth/register

Đăng ký user mới

```json
{
    "username": "string",
    "password": "string",
    "email": "string",
    "displayName": "string"
}
```

### POST /auth/login

Đăng nhập

```json
{
    "username": "string",
    "password": "string"
}
```

## Profile Routes

### GET /profile/me

Lấy profile của user hiện tại

### PUT /profile/me

Cập nhật profile

```json
{
    "displayName": "string",
    "email": "string",
    "avatarUrl": "string"
}
```

### GET /profile/search?q=query&limit=20

Tìm kiếm user

### GET /profile/users?limit=50

Lấy danh sách tất cả user

### GET /profile/users/:userId

Lấy thông tin user theo ID

## Conversation Routes

### POST /conversations

Tạo conversation mới

```json
{
    "type": "direct|group",
    "title": "string", // Optional cho group
    "memberIds": [1, 2, 3], // Array user IDs
    "avatarUrl": "string", // Optional
    "coverGifUrl": "string", // Optional
    "label": "Chill|Work|Gaming|Study|Team|Family|Custom" // Optional
}
```

### GET /conversations

Lấy tất cả conversation của user

### GET /conversations/:conversationId

Lấy chi tiết conversation và members

### PUT /conversations/:conversationId

Cập nhật thông tin conversation (chỉ admin)

```json
{
    "title": "string",
    "avatarUrl": "string",
    "coverGifUrl": "string",
    "label": "string"
}
```

### DELETE /conversations/:conversationId

Xóa conversation (chỉ admin)

### POST /conversations/:conversationId/members

Thêm member vào conversation (chỉ admin)

```json
{
    "userId": 123,
    "role": "member|admin"
}
```

### DELETE /conversations/:conversationId/members/:memberId

Xóa member khỏi conversation (chỉ admin hoặc tự xóa mình)

### POST /conversations/:conversationId/leave

Rời khỏi conversation

## Message Routes

### POST /messages

Gửi tin nhắn

```json
{
    "conversationId": 123,
    "content": "string",
    "contentType": "text|image|file|system"
}
```

### GET /messages/conversation/:conversationId?page=1&limit=50&before=timestamp

Lấy tin nhắn trong conversation với phân trang

### GET /messages/:messageId

Lấy chi tiết một tin nhắn

### PUT /messages/:messageId

Chỉnh sửa tin nhắn (chỉ người gửi)

```json
{
    "content": "string"
}
```

### DELETE /messages/:messageId

Xóa tin nhắn (chỉ người gửi)

### POST /messages/:messageId/read

Đánh dấu tin nhắn đã đọc

## Receipt Routes

### GET /receipts/message/:messageId

Lấy receipt cho một tin nhắn

### GET /receipts/unread

Lấy tất cả tin nhắn chưa đọc

### POST /receipts/conversation/:conversationId/read-all

Đánh dấu tất cả tin nhắn trong conversation đã đọc

### GET /receipts/unread-count

Lấy số tin nhắn chưa đọc theo từng conversation

## Socket.io Events

### Client Events (Gửi từ client)

-   `send_message` - Gửi tin nhắn
-   `edit_message` - Chỉnh sửa tin nhắn
-   `delete_message` - Xóa tin nhắn
-   `mark_message_read` - Đánh dấu đã đọc
-   `create_conversation` - Tạo conversation mới
-   `join_conversation` - Join conversation room
-   `leave_conversation` - Leave conversation room
-   `typing_start` - Bắt đầu gõ
-   `typing_stop` - Ngừng gõ
-   `get_online_users` - Lấy danh sách user online

### Server Events (Nhận từ server)

-   `new_message` - Tin nhắn mới
-   `message_edited` - Tin nhắn đã chỉnh sửa
-   `message_deleted` - Tin nhắn đã xóa
-   `message_read` - Tin nhắn đã được đọc
-   `conversation_created` - Conversation mới được tạo
-   `user_typing` - User đang gõ
-   `user_stop_typing` - User ngừng gõ
-   `user_online` - User online
-   `user_offline` - User offline
-   `online_users` - Danh sách user online
-   `error` - Lỗi

## Error Responses

### 400 Bad Request

```json
{
    "error": "Validation Error",
    "details": ["field is required"]
}
```

### 401 Unauthorized

```json
{
    "error": "Invalid token"
}
```

### 403 Forbidden

```json
{
    "error": "Only admins can perform this action"
}
```

### 404 Not Found

```json
{
    "error": "Resource not found"
}
```

### 409 Conflict

```json
{
    "error": "Duplicate entry",
    "message": "Resource already exists"
}
```

### 500 Internal Server Error

```json
{
    "error": "Internal Server Error"
}
```
