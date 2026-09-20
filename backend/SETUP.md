# DarshanSetu Backend - Complete Setup Guide

## 📋 Prerequisites

Before you start, ensure you have the following installed:

1. **Node.js** (v14.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` & `npm --version`

2. **MySQL** (v5.7 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

---

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`:
- express
- mysql2
- jsonwebtoken
- bcryptjs
- qrcode
- cors
- dotenv
- And others...

### Step 3: Setup MySQL Database

#### Option A: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE darshansetu;

# Use the database
USE darshansetu;

# Import schema
source backend/database/schema.sql;

# (Optional) Import sample data
source backend/database/seed.sql;

# Verify installation
SHOW TABLES;
```

#### Option B: Using MySQL Workbench or GUI

1. Open MySQL Workbench
2. Create new schema named `darshansetu`
3. Execute SQL script: `database/schema.sql`
4. (Optional) Execute: `database/seed.sql`

### Step 4: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# Database Configuration
DB_HOST=localhost          # MySQL host
DB_PORT=3306              # MySQL port (default)
DB_USER=root              # MySQL username
DB_PASSWORD=your_password # MySQL password
DB_NAME=darshansetu       # Database name

# Server Configuration
PORT=5000                 # Server port
NODE_ENV=development      # Environment (development/production)
API_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRY=7d             # Token expiry time

# Frontend Configuration
FRONTEND_URL=http://localhost:5173  # React app URL

# Temple Configuration
DEFAULT_TEMPLE_CAPACITY=10000
```

### Step 5: Verify Database Connection

Start the server to test the database connection:

```bash
npm run dev
```

You should see output like:
```
✅ MySQL Database connected successfully
✅ DarshanSetu Backend Server is running on http://localhost:5000
```

### Step 6: Test API Endpoints

#### Health Check (No Authentication Required)

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "DarshanSetu Backend is running",
  "timestamp": "2024-05-24T10:30:00.000Z"
}
```

#### Test Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "name": "Test User",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js           # MySQL connection pool
├── controllers/              # Business logic
│   ├── authController.js
│   ├── bookingController.js
│   ├── adminController.js
│   └── notificationController.js
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/                  # API endpoints
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── adminRoutes.js
│   └── notificationRoutes.js
├── utils/
│   └── helpers.js           # Utility functions
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
├── .env.example             # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── server.js               # Main server file
├── README.md               # Quick start guide
├── SETUP.md               # This file
└── API_DOCUMENTATION.md   # API reference
```

---

## 🔧 Configuration Details

### Database Connection

The database connection is configured in `config/database.js` using MySQL connection pooling for better performance.

**Connection Pool Settings:**
- Maximum connections: 10
- Connection timeout: Auto-handled
- Queue limit: 0 (unlimited)

### JWT Authentication

Tokens are generated on signup/login and must be included in subsequent requests:

```
Authorization: Bearer <token>
```

**Token Expiry:** Default 7 days (configurable via `JWT_EXPIRY`)

### CORS Configuration

CORS is enabled for frontend URL specified in `.env`:

```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

---

## 🏃 Running the Server

### Development Mode (with Auto-reload)

```bash
npm run dev
```

Uses **nodemon** for automatic restart on file changes.

### Production Mode

```bash
npm start
```

Direct Node.js execution without auto-reload.

### Server Output

On successful startup:
```
✅ MySQL Database connected successfully
✅ DarshanSetu Backend Server is running on http://localhost:5000
📝 Environment: development
🔗 Frontend URL: http://localhost:5173

📚 API Documentation:
   Auth Routes: /api/auth/*
   Booking Routes: /api/bookings/*
   Admin Routes: /api/admin/* (requires admin role)
   Notification Routes: /api/notifications/*
   Health Check: /api/health
```

---

## 🔐 User Roles & Permissions

### Role Hierarchy

1. **User** (Regular Visitor)
   - Browse temples & slots
   - Create bookings
   - View own bookings
   - Check-in
   - View notifications

2. **Staff** (Temple Staff)
   - All user permissions
   - View crowd status
   - Manage queue
   - Create emergency alerts

3. **Admin** (Administrator)
   - All staff permissions
   - View all analytics
   - Manage users
   - Update system settings
   - Full emergency management

### Creating Admin User

Default admin credentials (from seed data):
```
Email: admin@darshansetu.com
Password: password123
Role: admin
```

Or create new admin:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "securepassword123"
  }'
```

Then manually update the role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'newadmin@example.com';
```

---

## 📊 Sample Data

The `database/seed.sql` file includes:

- 7 Sample Temples
- Multiple Darshan Types
- Time Slots with varying occupancy
- 4 Sample Users (including admin & staff)
- 5 Sample Bookings
- Emergency Alerts
- Historical Analytics
- Notifications

To load sample data:

```bash
mysql -u root -p darshansetu < database/seed.sql
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Get all temples
curl http://localhost:5000/api/bookings/temples

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create booking (requires token from login)
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templeId": 1,
    "darshanTypeId": 1,
    "timeSlotId": 1,
    "numberOfVisitors": 2
  }'
```

### Using Postman

1. Import API endpoints from API_DOCUMENTATION.md
2. Set collection variable `token` from login response
3. Use `{{token}}` in Authorization header

### Using VS Code REST Client

Create `test.http` file:

```http
### Health Check
GET http://localhost:5000/api/health

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### Get Temples
GET http://localhost:5000/api/bookings/temples
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

**Error Message:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Ensure MySQL service is running
   - Windows: Check Services app
   - macOS: `brew services list`
   - Linux: `sudo service mysql status`

2. Verify credentials in `.env`
   - Check username and password
   - Ensure database exists: `SHOW DATABASES;`

3. Test connection manually:
   ```bash
   mysql -h localhost -u root -p darshansetu
   ```

### Issue: "Cannot find module" Error

**Solutions:**
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node.js version: `node --version` (should be v14+)

### Issue: Port Already in Use

**Error:** `listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change port in `.env`:
   ```env
   PORT=5001
   ```

2. Or kill process using port:
   ```bash
   # Linux/macOS
   lsof -i :5000
   kill -9 <PID>

   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Issue: JWT Token Invalid/Expired

**Solutions:**
1. Generate new token (login again)
2. Increase expiry time: `JWT_EXPIRY=30d` in `.env`
3. Check token format: Must be `Bearer <token>`

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solutions:**
1. Update `.env` FRONTEND_URL:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

2. Restart server after changes

---

## 📚 Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Connect to database
mysql -u root -p darshansetu

# View database tables
mysql -u root -p -e "USE darshansetu; SHOW TABLES;"

# Backup database
mysqldump -u root -p darshansetu > backup.sql

# Restore database
mysql -u root -p darshansetu < backup.sql
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong `JWT_SECRET`
   - Change default passwords

2. **Database**
   - Use strong MySQL password
   - Restrict database access
   - Regularly backup data

3. **Production**
   - Set `NODE_ENV=production`
   - Use HTTPS only
   - Implement rate limiting
   - Enable logging & monitoring

4. **API Security**
   - Validate all inputs
   - Use JWT for authentication
   - Implement role-based access
   - Hash passwords with bcrypt

---

## 📈 Performance Optimization

1. Database indexes are already configured
2. Connection pooling enabled (10 connections)
3. Use gzip compression in production
4. Cache frequently accessed data
5. Implement API rate limiting

---

## 🚀 Deployment

### Local Development
```bash
NODE_ENV=development
npm run dev
```

### Production Server
```bash
NODE_ENV=production
npm install --production
npm start
```

### Using PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start server.js --name "darshansetu-backend"
pm2 logs darshansetu-backend
pm2 save
```

---

## 📞 Support & Help

For detailed API documentation, see: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For quick start, see: [README.md](./README.md)

---

## ✅ Verification Checklist

- [ ] Node.js installed (v14+)
- [ ] MySQL installed and running
- [ ] Backend directory navigated to
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Database created (`darshansetu`)
- [ ] Schema imported (`schema.sql`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Health check works (`/api/health`)
- [ ] Signup/Login tested
- [ ] Database connection verified

---

**You're all set! 🎉 Happy coding!**
