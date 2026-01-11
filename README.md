# Adaayein — Fabric Marketplace & Design Showcase (MVP)

Adaayein is a full-stack web application that combines a **fabric marketplace** with a **designer showcase platform**.

It is built as a real-world MVP to explore how fabric inventory, designer portfolios, and customer purchasing can coexist in a single system with clearly defined roles and permissions.

---

## 🌐 Live Demo
👉 https://adaayein.vercel.app

---

## What Adaayein Does

- **Admins**
  - Manage fabric inventory with specifications and multiple images
  - Control fabric availability and featured design posts

- **Creators**
  - Publish design posts using fabrics from the marketplace
  - Maintain a public profile and portfolio

- **Customers**
  - Browse fabrics and designs
  - Add fabrics to cart (measured in meters)
  - Explore creators and featured content

---

## 🏗️ Architecture Overview

- **Frontend**: React (Vite, Tailwind CSS)
- **Backend**: Node.js + Express (REST API)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with role-based access control
- **Media Storage**: Cloudinary
- **State Management**: React Context API
- **Deployment**: Vercel (frontend)

The backend follows an **MVC architecture** with middleware-based authentication, authorization, validation, and centralized error handling.

---

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- Axios
- React Router

**Backend**
- Node.js
- Express
- MongoDB + Mongoose
- JWT & bcrypt
- Multer + Cloudinary
- express-validator

**Development Tools**
- ESLint
- nodemon

---

## 📁 Repository Structure

```
adaayen-mvp/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── scripts/
│   ├── API_DOCS.md
│   ├── package.json
│   └── server.js
└── README.md
```


---

## Documentation

Comprehensive documentation is available in the `backend/API_DOCS.md` file, including:
- Architecture & design decisions
- Database models
- API reference
- Authentication & authorization
- Deployment setup

---

## Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js** (version 16 or higher) and **npm**
- **MongoDB** (local installation or a cloud instance like MongoDB Atlas)
- A **Cloudinary** account for media storage (optional for basic functionality)

You will also need to set up environment variables. Copy the example `.env` file from the backend directory and configure it with your MongoDB URI, JWT secret, and Cloudinary credentials.

---

## Getting Started (Local)

### Backend Setup
```bash
cd backend
npm install
# Ensure MongoDB is running and .env is configured
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and the backend API at `http://localhost:5000` (or as configured).

---

## Project Status

Adaayein is an active MVP with:

- Core marketplace and creator features implemented
- Role-based access control
- A structured backend ready for future extensions

---

## License

This project is proprietary software.  
All rights reserved.