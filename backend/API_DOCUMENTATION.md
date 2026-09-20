# DarshanSetu Backend API Documentation

## Overview
This is the backend API for DarshanSetu - a predictive crowd intelligence system for temple darshan management.

**Base URL:** `http://localhost:5000/api`

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm

### Installation Steps

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials and configuration.

4. **Create database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE darshansetu;
   USE darshansetu;
   source database/schema.sql;
   ```

5. **Start the server:**
   ```bash
   npm run dev          # Development with nodemon
   npm start            # Production
   ```

Server will start on `http://localhost:5000`

---

## API Endpoints

### 1. Authentication Routes (`/api/auth`)

#### Signup
**POST** `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Current User
**GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user"
  }
}
```

#### Update Profile
**PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "John Doe Updated",
  "phone": "9876543211"
}
```

#### Change Password
**POST** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

### 2. Booking Routes (`/api/bookings`)

#### Get All Temples
**GET** `/api/bookings/temples`
**Response:**
```json
{
  "success": true,
  "message": "Temples retrieved",
  "data": [
    {
      "id": 1,
      "name": "Banke Bihari Temple",
      "location": "Vrindavan",
      "capacity": 10000,
      "description": "...",
      "image_url": "..."
    }
  ]
}
```

#### Get Temple Details
**GET** `/api/bookings/temples/:templeId`

#### Get Available Time Slots
**GET** `/api/bookings/time-slots?templeId=1&date=2024-05-25`

#### Create Booking
**POST** `/api/bookings/create`
- **Headers:** `Authorization: Bearer <token>`
```json
{
  "templeId": 1,
  "darshanTypeId": 1,
  "timeSlotId": 1,
  "numberOfVisitors": 3
}
```
**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingId": "BK-20240525-1278",
    "templeId": 1,
    "temple": "Banke Bihari Temple",
    "numberOfVisitors": 3,
    "gateAssignment": "A-127",
    "date": "2024-05-25",
    "time": "07:00:00 - 08:00:00",
    "estimatedWaitTime": "30 minutes",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### Get User Bookings
**GET** `/api/bookings/my-bookings`
- **Headers:** `Authorization: Bearer <token>`

#### Get Booking Details
**GET** `/api/bookings/:bookingId`
- **Headers:** `Authorization: Bearer <token>`

#### Cancel Booking
**POST** `/api/bookings/:bookingId/cancel`
- **Headers:** `Authorization: Bearer <token>`

#### Check-in to Darshan
**POST** `/api/bookings/checkin`
- **Headers:** `Authorization: Bearer <token>`
```json
{
  "bookingId": "BK-20240525-1278",
  "gateId": 1
}
```

---

### 3. Admin Routes (`/api/admin`) - Requires Admin Role

#### Get Crowd Status
**GET** `/api/admin/crowd/:templeId`
- **Headers:** `Authorization: Bearer <admin-token>`

**Response:**
```json
{
  "success": true,
  "message": "Crowd status retrieved",
  "data": {
    "temple_id": 1,
    "estimated_crowd": 7850,
    "capacity": 10000,
    "occupancy_percentage": "78.50",
    "risk_level": "high",
    "gates": [
      {
        "id": 1,
        "name": "Gate A",
        "capacity": 2000,
        "current_crowd": 1820,
        "occupancyPercentage": "91.00",
        "riskLevel": "critical"
      }
    ]
  }
}
```

#### Get Crowd Analytics
**GET** `/api/admin/analytics/crowd?templeId=1&startDate=2024-05-01&endDate=2024-05-31`

#### Get Booking Analytics
**GET** `/api/admin/analytics/booking?templeId=1`

#### Create Emergency Alert
**POST** `/api/admin/emergency/create`
- **Headers:** `Authorization: Bearer <admin-token>`
```json
{
  "templeId": 1,
  "alertType": "crowd_surge",
  "location": "Gate 3",
  "description": "Sudden crowd surge reported",
  "priority": "high"
}
```

#### Get Active Emergencies
**GET** `/api/admin/emergency/:templeId`

#### Update Emergency Status
**PUT** `/api/admin/emergency/:incidentId`
```json
{
  "status": "responding",
  "assignedStaff": 5
}
```

#### Get Parking Status
**GET** `/api/admin/parking/:templeId`

#### Update Parking Status
**PUT** `/api/admin/parking/:parkingId`
```json
{
  "occupied": 410
}
```

#### Get Queue Status
**GET** `/api/admin/queue/:gateId`

---

### 4. Notification Routes (`/api/notifications`)

#### Get Notifications
**GET** `/api/notifications?limit=10&offset=0&read_status=false`
- **Headers:** `Authorization: Bearer <token>`

#### Get Unread Count
**GET** `/api/notifications/unread-count`
- **Headers:** `Authorization: Bearer <token>`

#### Mark as Read
**PUT** `/api/notifications/:notificationId/read`
- **Headers:** `Authorization: Bearer <token>`

#### Mark All as Read
**POST** `/api/notifications/mark-all-read`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Notification
**DELETE** `/api/notifications/:notificationId`
- **Headers:** `Authorization: Bearer <token>`

---

## Error Handling

All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Database Schema

### Tables
- **users** - User accounts
- **temples** - Temple information
- **darshan_types** - Types of darshan offerings
- **time_slots** - Available booking slots
- **bookings** - User bookings
- **gates** - Temple gates and zones
- **queue_management** - Queue tracking
- **parking** - Parking areas
- **crowd_analytics** - Historical crowd data
- **emergency_alerts** - Emergency incident tracking
- **notifications** - User notifications
- **checkins** - Entry check-ins

---

## Key Features

✅ User Authentication (JWT-based)
✅ Darshan Booking System
✅ QR Code Generation
✅ Crowd Analytics & Prediction
✅ Emergency Management
✅ Parking Management
✅ Queue Management
✅ Real-time Notifications
✅ Admin Dashboard APIs
✅ Role-based Access Control

---

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=darshansetu

PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRY=7d

FRONTEND_URL=http://localhost:5173
DEFAULT_TEMPLE_CAPACITY=10000
```

---

## Testing

Use Postman or cURL to test the APIs.

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Future Enhancements

- WebSocket integration for real-time updates
- SMS/Email notifications
- Payment Gateway Integration
- ML-based crowd prediction
- Mobile app APIs
- Advanced analytics dashboard
- Multi-language support

---

## Support

For issues or questions, contact the development team.
