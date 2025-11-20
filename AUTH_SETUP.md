# WICFIN Authentication Setup Guide

## 🎯 Features Implemented

✅ **Google OAuth Login** - Users can sign in with their Google account
✅ **Email/Password Login** - Traditional authentication method
✅ **Two-Factor Authentication (2FA)** - TOTP-based using authenticator apps
✅ **Backup Codes** - 10 one-time use codes for account recovery
✅ **Free for Startups** - All solutions are free or have generous free tiers

---

## 🔐 Authentication Options

### 1. Google OAuth
- Users can sign in with "Continue with Google" button
- No password needed
- Faster onboarding

### 2. Email/Password
- Traditional login method
- Secure password hashing with bcrypt

### 3. Two-Factor Authentication (2FA)
- Optional extra security layer
- Uses authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)
- Generates backup codes for recovery

---

## 📋 Environment Variables

Your `.env.local` file should contain:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=1012539645753-gb8mcprkkk46iucs2ttnnqvlpuohnl8v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# NextAuth Configuration
NEXTAUTH_SECRET=1LU/njjKk/q9EVUp7YE+5Ysqvn3qPBj9OV1nrOd+HsI
NEXTAUTH_URL=http://localhost:3002

# Database
DATABASE_URL=postgresql://username@localhost:5432/wicfin_db
```

---

## 🚀 Google OAuth Setup

### Development (localhost)
Authorized Redirect URI:
```
http://localhost:3002/api/auth/callback/google
```

### Production (Render)
Authorized Redirect URI (replace with your app name):
```
https://your-app-name.onrender.com/api/auth/callback/google
```

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Add both redirect URIs above
5. Click **SAVE**

---

## 🗄️ Database Setup

### Schema Changes
The following fields have been added to the `users` table:

```typescript
- twoFactorSecret: text | null      // TOTP secret
- twoFactorEnabled: boolean         // 2FA status
- backupCodes: text[] | null        // Recovery codes
- provider: text                    // 'credentials' or 'google'
```

### Migration Steps
1. Update your PostgreSQL database:
   ```bash
   npm run db:push
   ```
   Or manually run:
   ```bash
   npx drizzle-kit push
   ```

---

## 📱 How to Use 2FA

### For Users:
1. **Login** to your account
2. Navigate to **Settings** → **Security** (`/settings/security`)
3. Click **"Enable 2FA"**
4. **Scan QR code** with authenticator app (Google Authenticator, Authy, etc.)
5. **Enter 6-digit code** from app
6. **Save backup codes** in a safe place
7. Done! Future logins will require the 6-digit code

### Backup Codes:
- 10 codes are generated when enabling 2FA
- Each code can only be used once
- Store them securely (password manager, encrypted notes)
- Use if you lose your authenticator device

---

## 🔗 Important Routes

| Route | Description |
|-------|-------------|
| `/auth/login` | Login page with Google OAuth + Email/Password |
| `/auth/register` | Sign up page |
| `/settings/security` | 2FA setup and management |
| `/api/auth/2fa/setup` | Generate QR code for 2FA |
| `/api/auth/2fa/verify` | Verify and enable 2FA |
| `/api/auth/2fa/disable` | Disable 2FA |

---

## 🎨 UI Features

### Login Page (`/auth/login`)
- **WICFIN branding** with logo
- **Google sign-in button** with official Google colors
- **Email/Password form** as fallback
- **Divider** between OAuth and traditional login
- **Responsive design** - mobile optimized
- **Dark theme** matching WICFIN brand

### 2FA Setup Page (`/settings/security`)
- **QR Code display** for easy scanning
- **Manual entry option** for authenticator apps
- **Backup codes display** after setup
- **Enable/Disable toggle**
- **Success/Error notifications**

---

## 🏗️ Deployment to Render

### Environment Variables to Set:
1. Go to your Render dashboard
2. Select your app
3. Go to **Environment** tab
4. Add all variables from `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Render URL)
   - `DATABASE_URL` (your PostgreSQL connection string)

### Update Google OAuth:
1. Add production redirect URI to Google Cloud Console:
   ```
   https://your-app-name.onrender.com/api/auth/callback/google
   ```

### Database:
- Use Render's PostgreSQL service (free tier: 90 days)
- Or use external PostgreSQL (Neon, Supabase free tiers)

---

## 🧪 Testing

### Test Google OAuth:
1. Click "Continue with Google" on login page
2. Select Google account
3. Should redirect to homepage after successful login

### Test 2FA:
1. Login with email/password
2. Go to `/settings/security`
3. Enable 2FA
4. Use Google Authenticator to scan QR
5. Save backup codes
6. Logout and login again
7. Should ask for 6-digit code

---

## 🔒 Security Notes

### What's Secure:
✅ Passwords hashed with bcrypt
✅ TOTP secrets stored encrypted
✅ Backup codes are one-time use
✅ Google OAuth uses official SDK
✅ Session management via NextAuth

### Best Practices:
- Keep `NEXTAUTH_SECRET` secret and random
- Use HTTPS in production (Render provides this)
- Encourage users to enable 2FA
- Store backup codes securely

---

## 📦 NPM Packages Used

```json
{
  "next-auth": "^5.0.0-beta.3",      // Authentication
  "speakeasy": "latest",              // TOTP generation
  "qrcode": "latest",                 // QR code generation
  "@types/speakeasy": "latest",       // TypeScript types
  "@types/qrcode": "latest"           // TypeScript types
}
```

---

## 🆘 Troubleshooting

### Google OAuth not working:
- Check redirect URI matches exactly
- Verify credentials in Google Cloud Console
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### 2FA QR code not generating:
- Check database connection
- Verify user is logged in
- Check browser console for errors

### Database errors:
- Run migrations: `npx drizzle-kit push`
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running

---

## 📞 Support

For issues or questions:
- Check Render logs for errors
- Review browser console
- Verify all environment variables are set
- Test locally first before deploying

---

**🎉 Setup Complete!** Your WICFIN app now has enterprise-grade authentication with Google OAuth and 2FA.
