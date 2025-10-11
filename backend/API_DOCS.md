📘 Adaayien Backend API Documentation

Base URL (Local):

http://localhost:5000/api

🧍‍♂️ Auth Routes
1️⃣ Register User

POST /auth/register

Headers:

Content-Type: application/json


Body:

{
  "name": "Amir",
  "email": "amir@example.com",
  "password": "123456"
}


Response:

{
  "_id": "abc123",
  "name": "Amir",
  "email": "amir@example.com",
  "token": "JWT_TOKEN"
}

2️⃣ Login User

POST /auth/login

Headers:

Content-Type: application/json


Body:

{
  "email": "amir@example.com",
  "password": "123456"
}


Response:

{
  "_id": "abc123",
  "name": "Amir",
  "email": "amir@example.com",
  "token": "JWT_TOKEN"
}

🧵 Fabric Routes
1️⃣ Get All Fabrics

GET /fabrics

Response:

[
  {
    "_id": "fab123",
    "name": "Royal Silk",
    "fabricType": "Silk",
    "color": "Emerald Green",
    "price": 1200,
    "description": "Premium silk fabric with glossy texture"
  }
]

2️⃣ Get Fabric by ID

GET /fabrics/:id

Response:

{
  "_id": "fab123",
  "name": "Royal Silk",
  "fabricType": "Silk",
  "color": "Emerald Green",
  "price": 1200,
  "description": "Premium silk fabric with glossy texture"
}

3️⃣ Create Fabric (Protected)

POST /fabrics

Headers:

Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>


Body:

{
  "name": "Royal Silk",
  "fabricType": "Silk",
  "color": "Emerald Green",
  "price": 1200,
  "description": "Premium silk fabric with a glossy texture",
  "imageUrl": "https://via.placeholder.com/150"
}


Response:

{
  "message": "Fabric created successfully",
  "fabric": {
    "_id": "fab123",
    "name": "Royal Silk",
    "fabricType": "Silk"
  }
}

4️⃣ Update Fabric (Protected)

PUT /fabrics/:id

Headers:

Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>


Body:

{
  "price": 1400,
  "color": "Deep Emerald"
}


Response:

{
  "message": "Fabric updated successfully"
}

5️⃣ Delete Fabric (Protected)

DELETE /fabrics/:id

Headers:

Authorization: Bearer <JWT_TOKEN>


Response:

{
  "message": "Fabric deleted successfully"
}

⚙️ Error Responses

Common:

{ "message": "Not authorized, no token" }

{ "message": "Fabric not found" }

{ "message": "Validation error: price is required" }

🧩 Tech Stack

Node.js + Express

MongoDB + Mongoose

JWT Authentication

express-validator + asyncHandler
