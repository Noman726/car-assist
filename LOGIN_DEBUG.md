# Login Debug Instructions

## Potential Issues and Solutions

### 1. **Check Firebase Console Settings**
- Go to https://console.firebase.google.com/project/carassist-d7c76
- Navigate to Authentication → Sign-in method
- Ensure "Email/Password" is enabled
- Check if there are any existing users

### 2. **Test with Firebase Test Page**
- Go to http://localhost:3002/firebase-test
- Click "Test Firebase Connection" first
- Then try "Test Car Creation" (this will create a test user)
- Use the credentials from that test for login

### 3. **Create a Test User**
If you need to create a test user manually:
- Email: test@carassist.com
- Password: test123456

### 4. **Check Browser Console**
- Open Developer Tools (F12)
- Check Console tab for any JavaScript errors
- Check Network tab for failed requests

### 5. **Common Login Issues**
- Wrong email/password
- User not created yet
- Firebase Authentication not enabled
- Network connectivity issues

### 6. **Signup First**
If login doesn't work, try going to:
- http://localhost:3002/signup
- Create a new account first
- Then try logging in with those credentials
