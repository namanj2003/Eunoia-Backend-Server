# Quick Setup Guide for Eunoia Backend Server

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in to your account
3. Click "Build a Database" or create a new project
4. Choose the FREE tier (M0 Sandbox)
5. Select a cloud provider and region (closest to you)
6. Click "Create Cluster"

## Step 2: Configure Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username and generate/create a strong password
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

**Important**: Save your username and password securely!

## Step 3: Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development:
   - Click "Allow Access from Anywhere"
   - Or click "Add Current IP Address" to whitelist your current IP
4. Click "Confirm"

## Step 4: Get Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Choose "Node.js" as driver and latest version
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Create .env File

1. In the Eunoia-Backend-Server folder, create a file named `.env`
2. Copy the contents from `.env.example`
3. Update these values:

```env
NODE_ENV=development
PORT=5000

# Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/eunoia-db?retryWrites=true&w=majority

# Generate a random string for JWT secret (use a password generator)
JWT_SECRET=your-random-secret-here-at-least-32-characters-long

JWT_EXPIRE=30d

# Your frontend URL (update when deployed)
CLIENT_URL=http://localhost:5173
```

**Replace**:
- `<username>` with your database username
- `<password>` with your database password
- `cluster0.xxxxx` with your actual cluster address
- `your-random-secret-here...` with a strong random string

## Step 6: Install Dependencies

```bash
cd Eunoia-Backend-Server
npm install
```

## Step 7: Run the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## Step 8: Test the Server

1. The server should start on http://localhost:5000
2. Check health endpoint: Open browser and go to http://localhost:5000/health
3. You should see: `{"success":true,"message":"Server is running","timestamp":"..."}`

## Step 9: Test API Endpoints

Use Postman, Thunder Client (VS Code extension), or curl to test:

### Register a user:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Save the `token` from the response for authenticated requests.

## Common Issues

### "MongooseServerSelectionError"
- Check your MongoDB connection string
- Verify your IP is whitelisted in Network Access
- Ensure username and password are correct

### "JWT_SECRET is not defined"
- Make sure `.env` file exists in the root folder
- Check that JWT_SECRET is set in .env
- Restart the server after creating .env

### Port already in use
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000

## Next Steps

1. Connect your frontend to the backend
2. Update CLIENT_URL in .env when you deploy
3. Use strong passwords and secrets in production
4. Enable additional security features for production

## Need Help?

- Check the main README.md for API documentation
- Review MongoDB Atlas documentation
- Check server logs for error messages
