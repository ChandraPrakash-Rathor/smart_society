# Backoffice — Smart Society API

Node.js + Express + MongoDB backend using MVC pattern.

## Setup

```bash
cd backoffice
npm install
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm run dev
```

## Folder Structure

```
backoffice/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── visitorController.js
│   ├── staffController.js
│   ├── guardController.js
│   └── notificationController.js
├── middleware/
│   └── authMiddleware.js      # JWT protect + adminOnly
├── models/
│   ├── User.js
│   ├── Visitor.js
│   ├── Staff.js
│   ├── Guard.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── visitorRoutes.js
│   ├── staffRoutes.js
│   ├── guardRoutes.js
│   └── notificationRoutes.js
├── .env.example
├── package.json
└── server.js
```

## API Endpoints

| Method | Endpoint                        | Auth     | Description            |
|--------|---------------------------------|----------|------------------------|
| POST   | /api/auth/register              | Public   | Register user          |
| POST   | /api/auth/login                 | Public   | Login                  |
| GET    | /api/auth/me                    | Protected| Get current user       |
| GET    | /api/visitors                   | Protected| List visitors          |
| POST   | /api/visitors                   | Protected| Add visitor            |
| PUT    | /api/visitors/:id               | Protected| Update visitor         |
| PATCH  | /api/visitors/:id/approve       | Protected| Approve visitor        |
| DELETE | /api/visitors/:id               | Admin    | Delete visitor         |
| GET    | /api/staff                      | Protected| List staff             |
| POST   | /api/staff                      | Admin    | Add staff              |
| PATCH  | /api/staff/:id/checkin          | Protected| Staff check-in         |
| PATCH  | /api/staff/:id/checkout         | Protected| Staff check-out        |
| GET    | /api/guards                     | Protected| List guards            |
| POST   | /api/guards/:id/patrol          | Protected| Add patrol log         |
| GET    | /api/notifications              | Protected| Get notifications      |
| PATCH  | /api/notifications/read-all     | Protected| Mark all read          |
