# DarshanSetu Backend

This is the Node.js + Express backend server for the DarshanSetu application - a predictive crowd intelligence system for temple darshan management.

## 📋 Project Structure

```
backend/
├── config/              # Configuration files
│   └── database.js      # Database connection pool
├── controllers/         # Route controllers
│   ├── authController.js          # Authentication logic
│   ├── bookingController.js       # Booking management
│   ├── adminController.js         # Admin operations
│   └── notificationController.js  # Notifications
├── middleware/          # Express middleware
│   └── auth.js         # JWT & role verification
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── adminRoutes.js
│   └── notificationRoutes.js
├── utils/              # Utility functions
│   └── helpers.js      # Common functions
├── database/           # Database setup
│   └── schema.sql      # SQL schema
├── .env.example        # Environment variables template
├── package.json        # Dependencies
├── server.js           # Main server file
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v14 or higher
- **MySQL** v5.7 or higher
- **npm** v6 or higher

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=darshansetu
   ```

3. **Create database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE darshansetu;"
   mysql -u root -p darshansetu < database/schema.sql
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   Server will be available at: `http://localhost:5000`

## Crowd API

Crowd reads require a bearer token. Staff and admins may record a crowd observation.

```text
GET  /api/crowd/live/:templeId
GET  /api/crowd/history/:templeId?limit=24
POST /api/crowd
```

The live response is calculated from current gate counts and today's confirmed
bookings. It includes visitors, capacity, occupancy, wait time, risk, and gate status.

The optional prediction service in `../ai-service` runs with:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick API Examples

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create Booking:**
```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templeId": 1,
    "darshanTypeId": 1,
    "timeSlotId": 1,
    "numberOfVisitors": 3
  }'
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

1. Get token from `/api/auth/login` or `/api/auth/signup`
2. Include token in request header:
   ```
   Authorization: Bearer <your_token>
   ```

## 👥 User Roles

- **user** - Regular temple visitor
- **staff** - Temple staff member
- **admin** - Administrator

## 🎯 Key Features

✅ **User Management**
- Signup & Login with JWT
- Profile management
- Password change

✅ **Darshan Booking**
- Browse temples & time slots
- Create & manage bookings
- Generate QR codes
- Check-in system

✅ **Crowd Intelligence**
- Real-time crowd status
- Historical analytics
- Risk assessment
- Gate-wise occupancy

✅ **Emergency Management**
- Emergency alert creation
- Incident tracking
- Staff assignment
- Emergency notifications

✅ **Parking Management**
- Real-time parking status
- Capacity management
- Occupancy tracking

✅ **Queue Management**
- Queue tracking
- Wait time estimation
- Queue position updates

✅ **Notifications**
- In-app notifications
- Read/unread tracking
- Notification types

## 📊 Database

The MySQL database includes tables for:
- Users & Authentication
- Temples & Darshan Info
- Bookings & Time Slots
- Gates & Zones
- Crowd Analytics
- Emergency Alerts
- Parking & Queue
- Notifications
- Check-ins

See [database/schema.sql](./database/schema.sql) for complete schema.

## 🔧 Configuration

Edit `.env` file to customize:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=darshansetu

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Temple
DEFAULT_TEMPLE_CAPACITY=10000
```

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - Database driver
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **qrcode** - QR code generation
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **joi** - Data validation
- **multer** - File uploads
- **nodemon** - Auto-reload (dev)

## 🧪 Testing

Test the API using:
- **Postman** - GUI client
- **cURL** - Command line
- **Insomnia** - REST client
- **Thunder Client** - VS Code extension

## 📈 Performance Tips

1. Ensure MySQL indexes are created (schema includes them)
2. Use connection pooling (configured in database.js)
3. Enable gzip compression in production
4. Cache frequently accessed data
5. Implement rate limiting for production

## 🐛 Troubleshooting

**Database Connection Error:**
```
Check if MySQL is running
Verify credentials in .env
Ensure database exists
```

**JWT Token Issues:**
```
Token may be expired (default 7 days)
Check JWT_SECRET matches in .env
Ensure token format: "Bearer <token>"
```

**CORS Errors:**
```
Update FRONTEND_URL in .env
Ensure frontend URL matches exactly
```

## 🚀 Deployment

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Install dependencies: `npm install`
4. Start server: `npm start`
5. Use PM2 for process management: `pm2 start server.js`

## 📝 Environment Setup Examples

**Local Development:**
```env
NODE_ENV=development
DB_HOST=localhost
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Production:**
```env
NODE_ENV=production
DB_HOST=your.database.com
PORT=3000
FRONTEND_URL=https://yourapp.com
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📞 Support

For issues, feature requests, or questions:
- Contact the development team
- Check API documentation
- Review database schema

## 📄 License

MIT License - See LICENSE file for details

---

**Happy coding! 🙌**
