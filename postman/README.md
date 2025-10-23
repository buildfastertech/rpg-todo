# Postman Collection for RPG Todo API

This directory contains Postman collections and environment files for testing the RPG Todo API.

## Files

- `RPG-Todo-API.postman_collection.json` - Complete API collection with all endpoints
- `RPG-Todo-Local.postman_environment.json` - Local development environment (localhost:3001)
- `RPG-Todo-Production.postman_environment.json` - Production environment (to be configured)

## Setup Instructions

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `RPG-Todo-API.postman_collection.json`
4. Collection will appear in your workspace

### 2. Import Environment

1. Click the environment selector (top right)
2. Click **Import**
3. Select `RPG-Todo-Local.postman_environment.json`
4. Select the environment from the dropdown

### 3. Start Testing

1. Ensure your server is running (`npm run dev` in server directory)
2. Select "RPG Todo - Local" environment
3. Run the **Health Check** to verify connection
4. Test authentication endpoints

## Environment Variables

The environment files include these variables:

- `base_url` - API base URL (e.g., http://localhost:3001)
- `auth_token` - JWT token (automatically set after login/register)
- `user_id` - Current user ID (automatically set after login/register)
- `task_id` - Task ID for testing (manually set or from response)

## Auto-Saved Tokens

The **Register** and **Login** requests include test scripts that automatically save:
- JWT token to `auth_token` environment variable
- User ID to `user_id` environment variable

This means after successful login/register, all protected endpoints will automatically use the token.

## Endpoint Organization

### 1. Health
- `GET /health` - Server health check

### 2. Authentication
- `POST /api/auth/register` - Register new user (awards 5 XP)
- `POST /api/auth/login` - Login user (awards 2 XP daily)
- `POST /api/auth/logout` - Logout user

### 3. Users (Coming Soon)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user stats (XP, level, achievements)
- `GET /api/users/xp-history` - Get XP transaction history

### 4. Tasks (Coming Soon)
- `GET /api/tasks` - Get tasks (with filtering)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task
- `PATCH /api/tasks/:taskId/complete` - Complete task (awards XP)
- `PATCH /api/tasks/:taskId/archive` - Archive task
- `DELETE /api/tasks/:taskId` - Delete task

### 5. Achievements (Coming Soon)
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user's unlocked achievements

## Testing Flow

### First Time Setup
1. Run **Health Check** to verify server is running
2. Run **Register** to create a new user
   - Token is automatically saved
   - Returns user with 5 XP and Level 1
3. You're ready to test other endpoints!

### Subsequent Sessions
1. Run **Health Check** to verify server
2. Run **Login** to get a new token
   - Token is automatically saved
   - Awards 2 XP if first login of the day
   - Shows "You leveled up!" message if applicable

### Testing XP System
1. Login multiple times on different days to see daily XP awards
2. Complete tasks to earn XP (when task endpoints are implemented)
3. Watch for level-up messages in login responses

## Tips

- Use Postman environments to easily switch between local and production
- Check the Console tab in Postman to see auto-save script output
- The token expires after 7 days - you'll need to login again
- All protected endpoints require the `Authorization: Bearer {{auth_token}}` header (already configured)

## Troubleshooting

**"Authentication required" error:**
- Make sure you're logged in (token is saved)
- Check that the Local environment is selected
- Token may have expired (7 days) - login again

**"Connection refused" error:**
- Verify server is running: `npm run dev` in server directory
- Check base_url is correct: http://localhost:3001

**"Invalid email or password" error:**
- Verify credentials in request body
- If user doesn't exist, register first

## Production Environment

To use the production environment:
1. Deploy your API to Vercel or another hosting service
2. Update `base_url` in `RPG-Todo-Production.postman_environment.json`
3. Select "RPG Todo - Production" environment in Postman
4. Test endpoints against production

## Notes

- Password must be at least 8 characters with uppercase, lowercase, and number
- Username must be 3-50 characters (alphanumeric + underscore)
- Email must be valid format
- Endpoints marked "Coming Soon" are placeholders for future implementation

