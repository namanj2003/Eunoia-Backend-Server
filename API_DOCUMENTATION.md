# Eunoia Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
}
```

### 2. Login User
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
}
```

### 3. Get Current User Profile
**GET** `/auth/me`

Get logged-in user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

### 4. Update Profile
**PUT** `/auth/updateprofile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Updated",
    "email": "newemail@example.com"
  }
}
```

### 5. Change Password
**PUT** `/auth/changepassword`

Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "token": "new_jwt_token_here"
  }
}
```

---

## Journal Endpoints

### 1. Get All Journal Entries
**GET** `/journal`

Get all journal entries for the logged-in user with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `order` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Example:**
```
GET /journal?page=1&limit=10&sortBy=createdAt&order=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "entry_id",
      "userId": "user_id",
      "title": "My First Entry",
      "content": "Today was a great day...",
      "mood": "happy",
      "tags": ["gratitude", "mindfulness"],
      "isPrivate": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 42
}
```

### 2. Get Single Journal Entry
**GET** `/journal/:id`

Get a specific journal entry by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "userId": "user_id",
    "title": "My First Entry",
    "content": "Today was a great day...",
    "mood": "happy",
    "tags": ["gratitude"],
    "isPrivate": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Journal Entry
**POST** `/journal`

Create a new journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Entry",
  "content": "Today I learned something amazing...",
  "mood": "happy",
  "tags": ["learning", "growth"],
  "isPrivate": true
}
```

**Mood Options:**
- `very-happy`
- `happy`
- `neutral`
- `sad`
- `very-sad`
- `anxious`
- `calm`
- `stressed`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "userId": "user_id",
    "title": "My New Entry",
    "content": "Today I learned something amazing...",
    "mood": "happy",
    "tags": ["learning", "growth"],
    "isPrivate": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Journal Entry
**PUT** `/journal/:id`

Update an existing journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "mood": "calm",
  "tags": ["reflection"],
  "isPrivate": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "title": "Updated Title",
    "content": "Updated content...",
    ...
  }
}
```

### 5. Delete Journal Entry
**DELETE** `/journal/:id`

Delete a journal entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Journal entry deleted successfully"
}
```

### 6. Search Journal Entries
**GET** `/journal/search`

Search journal entries by text, mood, or date range.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `query` (optional): Text search in title, content, or tags
- `mood` (optional): Filter by mood
- `startDate` (optional): Filter entries after this date (ISO format)
- `endDate` (optional): Filter entries before this date (ISO format)

**Example:**
```
GET /journal/search?query=gratitude&mood=happy&startDate=2025-01-01
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

---

## Chat Endpoints

### 1. Get All Chat Sessions
**GET** `/chat/sessions`

Get all chat sessions for the logged-in user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "session_doc_id",
      "userId": "user_id",
      "sessionId": "unique_session_id",
      "title": "Therapy Session 1",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastMessageAt": "2025-01-01T01:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### 2. Create Chat Session
**POST** `/chat/sessions`

Create a new chat session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Chat Session"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "session_doc_id",
    "userId": "user_id",
    "sessionId": "generated_session_id",
    "title": "My New Chat Session",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastMessageAt": "2025-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

### 3. Get Chat Session with Messages
**GET** `/chat/sessions/:sessionId`

Get a chat session and all its messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": {
      "_id": "session_doc_id",
      "sessionId": "session_id",
      "title": "Therapy Session 1",
      ...
    },
    "messages": [
      {
        "_id": "message_id",
        "userId": "user_id",
        "sessionId": "session_id",
        "role": "user",
        "content": "I'm feeling anxious today",
        "timestamp": "2025-01-01T00:00:00.000Z"
      },
      {
        "_id": "message_id_2",
        "role": "assistant",
        "content": "I understand. Can you tell me more?",
        "timestamp": "2025-01-01T00:00:30.000Z"
      }
    ]
  }
}
```

### 4. Get Chat Messages
**GET** `/chat/sessions/:sessionId/messages`

Get messages for a specific session with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `before` (optional): Get messages before this timestamp

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "message_id",
      "userId": "user_id",
      "sessionId": "session_id",
      "role": "user",
      "content": "Message content...",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 5. Add Message to Session
**POST** `/chat/sessions/:sessionId/messages`

Add a new message to a chat session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "user",
  "content": "I've been feeling much better lately"
}
```

**Role Options:**
- `user`: Message from the user
- `assistant`: Response from AI/therapist
- `system`: System message

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "message_id",
    "userId": "user_id",
    "sessionId": "session_id",
    "role": "user",
    "content": "I've been feeling much better lately",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

### 6. Update Chat Session
**PUT** `/chat/sessions/:sessionId`

Update chat session title.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Session Title"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "session_doc_id",
    "sessionId": "session_id",
    "title": "Updated Session Title",
    ...
  }
}
```

### 7. Delete Chat Session
**DELETE** `/chat/sessions/:sessionId`

Delete (soft delete) a chat session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details..."
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All endpoints return JSON
3. Content-Type should be `application/json` for all requests with body
4. Token expires after 30 days (configurable in .env)
5. Passwords are hashed using bcrypt
6. All user-specific data is isolated per user account
