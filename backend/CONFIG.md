# DarshanSetu Backend - Environment Configuration Guide

## Environment Variables

The `.env` file contains all configuration settings for the backend. Copy `.env.example` to `.env` and update values as needed.

### Database Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=darshansetu
```

- **DB_HOST** - MySQL server address
- **DB_PORT** - MySQL server port (default: 3306)
- **DB_USER** - MySQL username
- **DB_PASSWORD** - MySQL password
- **DB_NAME** - Database name

### Server Configuration

```env
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
```

- **PORT** - Express server port (default: 5000)
- **NODE_ENV** - Environment (development/production)
- **API_URL** - API base URL

### JWT Configuration

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
```

- **JWT_SECRET** - Secret key for signing tokens (⚠️ Change in production!)
- **JWT_EXPIRY** - Token expiry time (e.g., 7d, 24h, 30d)

### Frontend Configuration

```env
FRONTEND_URL=http://localhost:5173
```

- **FRONTEND_URL** - React app URL for CORS

### Temple Configuration

```env
DEFAULT_TEMPLE_CAPACITY=10000
```

- **DEFAULT_TEMPLE_CAPACITY** - Default temple capacity

### Email Configuration (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

### QR Code Configuration

```env
QR_CODE_SIZE=300
```

---

## Environment Profiles

### Development Environment (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=darshansetu

PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
JWT_SECRET=dev_secret_key_not_for_production
JWT_EXPIRY=7d

FRONTEND_URL=http://localhost:5173
DEFAULT_TEMPLE_CAPACITY=10000

QR_CODE_SIZE=300
```

### Production Environment

```env
DB_HOST=prod.database.server.com
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_NAME=darshansetu_prod

PORT=3000
NODE_ENV=production
API_URL=https://api.darshansetu.com
JWT_SECRET=very_long_and_complex_secret_key_at_least_32_chars
JWT_EXPIRY=30d

FRONTEND_URL=https://darshansetu.com
DEFAULT_TEMPLE_CAPACITY=10000

QR_CODE_SIZE=300
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@darshansetu.com
SMTP_PASSWORD=app_password_here
```

### Staging Environment

```env
DB_HOST=staging.database.server.com
DB_PORT=3306
DB_USER=staging_user
DB_PASSWORD=staging_password
DB_NAME=darshansetu_staging

PORT=5000
NODE_ENV=staging
API_URL=https://staging-api.darshansetu.com
JWT_SECRET=staging_secret_key
JWT_EXPIRY=14d

FRONTEND_URL=https://staging.darshansetu.com
DEFAULT_TEMPLE_CAPACITY=10000
```

---

## Configuration Recommendations

### JWT Secret Generation

For production, generate a strong random secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 32
```

### Database Password Security

- Use strong passwords (mix of uppercase, lowercase, numbers, special chars)
- Minimum 12 characters recommended
- Store securely, never in version control

### Port Selection

- Development: 5000 (avoids conflicts with common ports)
- Production: 3000, 8000, or behind reverse proxy
- Never expose database port publicly

### CORS Configuration

- Development: `http://localhost:5173` (Vite default)
- Production: Use exact domain without trailing slash
- Multiple domains: Configure in middleware

### Node Environment

- **development** - Full logging, no optimization
- **production** - Minimal logging, optimized for performance
- **staging** - Production-like with debugging enabled

---

## Verifying Configuration

### Test Database Connection

```bash
npm run dev
```

Look for: `✅ MySQL Database connected successfully`

### Test API Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "DarshanSetu Backend is running"
}
```

### Verify JWT

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## Common Issues

### "Cannot connect to database"

Check:
- MySQL is running
- Credentials are correct
- Database exists: `SHOW DATABASES;`
- Port is accessible

### "JWT_SECRET is not defined"

Check:
- `.env` file exists
- `JWT_SECRET` line is not commented
- No extra spaces around `=` sign

### "CORS policy: blocked"

Check:
- `FRONTEND_URL` matches your frontend URL exactly
- No trailing slash on URL
- Both backend and frontend have matching protocol (http/https)

### "Port 5000 already in use"

Change port in `.env`:
```env
PORT=5001
```

Or stop the process using the port.

---

## Environment Variable Validation

On startup, the application validates:
- Database connection
- JWT configuration
- Port availability
- Frontend URL format

All critical variables must be set before server starts.

---

## Migration Checklist

When moving from development to production:

- [ ] Update DB credentials
- [ ] Generate new JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_URL
- [ ] Verify SMTP credentials (if using email)
- [ ] Test health endpoint
- [ ] Test authentication flow
- [ ] Verify database backup
- [ ] Setup logging/monitoring
- [ ] Configure SSL certificates
- [ ] Setup automated backups

---

## Security Notes

⚠️ **NEVER commit `.env` file to version control**

```bash
# Already in .gitignore
.env
.env.local
```

Keep sensitive data safe:
- Use `.env.example` as template
- Share only non-sensitive config
- Rotate secrets regularly in production
- Use environment-specific files for different deploys

---

For more information, see:
- [README.md](./README.md) - Quick start
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
