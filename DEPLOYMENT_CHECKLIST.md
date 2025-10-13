# Render Deployment Checklist

## Before Deployment

- [ ] MongoDB Atlas database is set up
- [ ] MongoDB allows connections from anywhere (0.0.0.0/0)
- [ ] Generated secure JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Gmail app password created (if using email features)
- [ ] Code committed to git
- [ ] Code pushed to GitHub

## Render Configuration

- [ ] Created new Web Service on Render
- [ ] Connected GitHub repository
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added all environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRE=7d
  - [ ] CLIENT_URL (your frontend URL)
  - [ ] EMAIL_USER
  - [ ] EMAIL_PASSWORD
- [ ] Deployed service

## After Deployment

- [ ] Test health endpoint: `https://your-backend.onrender.com/health`
- [ ] Copy backend URL
- [ ] Update frontend API_BASE_URL
- [ ] Update CLIENT_URL in Render environment variables after frontend is deployed
- [ ] Test registration
- [ ] Test login
- [ ] Test journal creation
- [ ] Test AI chat

## Environment Variables Reference

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=64-character-random-string
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app-password
```

## Common Issues

**Service won't start:**
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MONGODB_URI is correct

**CORS errors:**
- Update CLIENT_URL with your deployed frontend URL
- Make sure there's no trailing slash in URLs

**Database connection fails:**
- Check MongoDB Atlas network access allows 0.0.0.0/0
- Verify credentials in MONGODB_URI
- Check database user has proper permissions

**Free tier sleeps:**
- First request takes 30+ seconds after inactivity
- Consider UptimeRobot to keep it awake
- Or upgrade to paid plan ($7/month)

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Update CLIENT_URL in Render with frontend URL
3. Update frontend with Render backend URL
4. Test complete flow
