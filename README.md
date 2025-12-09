<img src="./logo.png" width="500"/>
<div align="center">
⚡ POWER-GRIFO — Fault Analyzer

Automated fault logging, pattern detection, dashboard analytics & real-time admin monitoring.








</div>
📑 Table of Contents

🚀 Project Overview

🧩 Problem Statement

✨ Features Implemented

🛠️ Tech Stack

🏗️ System Architecture

📡 API Documentation

⚙️ Setup Instructions

🚀 Deployment Links

🖼️ Screenshots

🛡️ Error Handling

🤖 AI--ML Integration

👥 Team

🚧 Future Improvements

✔️ GitHub Hygiene

💬 Final Note

🚀 Project Overview

POWER-GRIFO Fault Analyzer is a cloud-integrated, fault-logging and admin analytics system for recording user complaints, detecting repeated issues automatically, and providing real-time insights through an interactive dashboard.

It is designed with:

Speed

Reliability

Security

Scalable Architecture

🧩 Problem Statement

PS Number: PS–XX

Users submit technical complaints/issues through multiple channels, causing:

Duplicate requests

Delays in resolution

Lack of analytics
POWER-GRIFO centralizes and digitizes the entire flow, enabling smart complaint monitoring and analysis.

✨ Features Implemented

✅ Authentication & Authorization

JWT based login/register

Role based access (User/Admin)

⚠️ Rate Limiting

Prevent spam submission

Restrict complaints count per user

🧾 Complaint Management

Submit complaint + file upload

View list of complaints

Admin approval system

🧠 Smart Analysis

Detect repeated fault patterns

Redis caching + quick lookup

📦 Cloud Integrations

MongoDB Atlas

Cloudinary for image uploads

Redis for caching

📊 Admin Dashboard

Filter & sort complaints

Real-time updates

🛠️ Tech Stack
Frontend:
  - React
  - TailwindCSS
  - ShadCN UI

Backend:
  - Node.js
  - Express.js
  - JWT Authentication

Database:
  - MongoDB (Mongoose)

Cloud / Services:
  - Cloudinary
  - Redis

Deployment:
  - Render / Railway (Backend)
  - Vercel / Netlify (Frontend)

🏗️ System Architecture
flowchart TD
A[Frontend - React] --> B[Express API]
B --> C[(MongoDB Atlas)]
B --> D[(Redis Cache)]
B --> E[(Cloudinary Storage)]

📡 API Documentation

👉 Add real route examples once finalized.

🔑 Auth
Method	Route	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
📝 Complaints
Method	Route	Description
POST	/api/complaints	Submit complaint
GET	/api/complaints	Get all complaints
GET	/api/complaints/:id	Get single complaint
DELETE	/api/complaints/:id	Delete complaint
⚙️ Setup Instructions
🔧 Backend Setup
cd backend
npm install


Create .env:

PORT=5000
MONGO_URI=xxx
JWT_SECRET=xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
REDIS_URL=xxx

npm run dev

🎨 Frontend Setup
cd frontend
npm install
npm run dev

🚀 Deployment Links

⚠️ Update before submission

🌐 Live App: https://
🛠️ API: https://
📁 GitHub: https://github.com/
...

🖼️ Screenshots
UI Screen	Preview
Login Page	🖼️
Complaint Form	🖼️
Admin Dashboard	🖼️
Fault Analysis Table	🖼️
🛡️ Error Handling

Global error middleware in Express

Async wrapper for controllers

Proper HTTP status codes

Validation for file upload & JSON input

Redis-based request limiting

🤖 AI/ML Integration

If not used, write: N/A

Example (optional):

Rule-based NLP for repeated complaint detection

Similarity check using cosine similarity

👥 Team

Solo Developer — POWER-GRIFO Author

Full-stack development

UI/UX

Deployment

Testing & documentation

🚧 Future Improvements

Email notifications for recurring faults

Admin analytics charts

CSV/PDF export

WebSocket real-time updates

Multi-admin management
