# Quick Setup Guide - Simplified Authentication

## What Changed?
Your login system now requires **only Name and Mobile Number** - no email or password needed!

## Step 1: Update Database Schema
Run this SQL on your database to update the users table:

```sql
-- Drop the existing users table (CAREFUL: backs up data first!)
-- ALTER TABLE bookings DROP FOREIGN KEY bookings_ibfk_1;
-- ALTER TABLE queue_management DROP FOREIGN KEY queue_management_ibfk_2;
-- DROP TABLE users;

-- Or simply modify the existing table:
ALTER TABLE users MODIFY email VARCHAR(100) UNIQUE NULL;
ALTER TABLE users MODIFY password VARCHAR(255) NULL;
ALTER TABLE users ADD UNIQUE KEY unique_phone (phone);
ALTER TABLE users MODIFY phone VARCHAR(20) UNIQUE NOT NULL;
```

## Step 2: Restart Servers

### Backend
```bash
cd backend
npm install  # If needed
npm run dev
```

### Frontend
```bash
cd frontend
npm install  # If needed
npm run dev
```

## Step 3: Test the New Login

### Expected User Experience:
1. Go to login page
2. Enter: Full Name (e.g., "John Doe")
3. Enter: Mobile Number (e.g., "9876543210")
4. Click "Sign in"
5. **First time?** → Account created automatically
6. **Returning user?** → Logged in with existing account
7. Redirected to Dashboard

## Step 4: Validation Rules (What Users Will See)

### Full Name
- ✅ At least 2 characters
- ✅ Letters and spaces only
- ❌ No numbers or special characters
- ❌ Single character names rejected

### Mobile Number
- ✅ Exactly 10 digits
- ✅ Starts with 6, 7, 8, or 9
- ✅ Spaces and hyphens are removed automatically
- ❌ Numbers starting with 0-5 rejected
- ❌ Less than 10 digits rejected

## Example Valid Inputs

| Full Name | Mobile Number | Status |
|-----------|---------------|--------|
| John Doe | 9876543210 | ✅ Valid |
| Jane Smith | 98-7654-3210 | ✅ Valid (hyphens removed) |
| Raj Kumar | 98 7654 3210 | ✅ Valid (spaces removed) |
| A | 9876543210 | ❌ Name too short |
| John123 | 9876543210 | ❌ Numbers in name |
| John Doe | 1234567890 | ❌ Phone starts with 1 |
| John Doe | 987654321 | ❌ Phone too short |

## Files Modified

✅ `backend/database/schema.sql` - Users table updated
✅ `backend/utils/helpers.js` - New validation functions
✅ `backend/controllers/authController.js` - Simplified auth logic
✅ `backend/routes/authRoutes.js` - Removed /signup endpoint
✅ `frontend/src/api/client.js` - Updated login call
✅ `frontend/src/pages/Login.jsx` - New login form
✅ `frontend/src/styles/login.css` - Enhanced styling

## Troubleshooting

### "User already exists with this phone"
✅ This is expected! The system checks if the phone number exists. If it does, it logs in that user instead of creating a duplicate.

### Form won't submit
Check the error messages:
- "Full name should contain at least 2 characters and only letters"
- "Please enter a valid 10-digit Indian mobile number (starting with 6-9)"

Make sure you're entering valid data.

### Token not storing
Check browser's localStorage:
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Should see `darshansetu_token` and `darshansetu_user`

If not, check browser console for errors.

### Protected routes showing 401 Unauthorized
Token may have expired or localStorage was cleared. Log in again.

## API Endpoint Details

### Login (Public)
```
POST /api/auth/login
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "9876543210"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

### Get Current User (Protected)
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "9876543210",
    "role": "user"
  }
}
```

### Update Profile (Protected)
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe"
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "phone": "9876543210",
    "role": "user"
  }
}
```

## What Got Removed

❌ `/signup` endpoint - No longer needed
❌ `/change-password` endpoint - No password system
❌ Email field - Not required
❌ Password hashing - No passwords stored

## Security Notes

🔒 **Phone numbers are unique** - Each user has one unique phone number
🔒 **No passwords** - Simpler, less risk of compromise
🔒 **JWT tokens** - Secure token-based authentication
🔒 **Validated input** - Both client and server validation

## Common Questions

**Q: How do I change my name/phone?**
A: Name can be updated via the Profile API endpoint. Phone number is unique and cannot be changed (it's the account identifier).

**Q: What if I forget my password?**
A: There are no passwords! You only need to remember your phone number.

**Q: Can two accounts have the same phone number?**
A: No, phone numbers are unique. If you try to login with an existing phone, the existing account is used.

**Q: How long is the login token valid?**
A: Check your `.env` file for `JWT_EXPIRY` (default: 7 days).

## Support

For issues or questions, check:
1. Browser console for error messages
2. Server logs for API errors
3. `AUTH_UPDATE_SUMMARY.md` for detailed implementation info
