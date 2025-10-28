POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "creator"  // Optional: "creator" (default) or "admin"
}

Response: {
  "message": "Registration successful",
  "token": "JWT_TOKEN",
  "creator": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "creator"
  }
}
