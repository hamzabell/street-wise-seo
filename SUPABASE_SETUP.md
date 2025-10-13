# Supabase Setup Guide

This guide will help you set up Supabase authentication for your application after the migration from JWT-based auth.

## 🚀 Quick Setup (5 minutes)

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or create an account
4. Create a new organization (or use existing)
5. Create a new project:
   - **Project Name**: `your-app-name` (any name you prefer)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to your users
   - **Wait for project to be ready** (2-3 minutes)

### 2. Get Your Supabase Credentials
Once your project is ready:

1. Go to **Project Settings** (click the gear icon ⚙️)
2. Navigate to **API** section
3. Copy these values:

**Project URL**:
```
https://your-project-id.supabase.co
```

**Anon/Public Key**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2NjAwMDAwLCJleHAiOjE5MzIxNjAwMDB9.YOUR_ACTUAL_ANON_KEY
```

**Service Role Key** (keep this secret!):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MTY2MDAwMDAsImV4cCI6MTkzMjE2MDAwMH0.YOUR_ACTUAL_SERVICE_ROLE_KEY
```

### 3. Update Your .env File
Replace the placeholder values in your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

### 4. Configure Supabase Auth Settings
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/` (for production, use your actual domain)
4. Ensure **Enable email confirmations** is **ON**
5. Click **Save**

### 5. Test the Setup
1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Open your browser to `http://localhost:3000`

3. Test the authentication flow:
   - Try to **sign up** with a new email
   - Check your email for the confirmation link
   - Click the confirmation link
   - You should be redirected to the dashboard
   - Try **signing out** and **signing in** again

## 🎯 Demo Account Setup (Optional)

If you want to create a demo account for testing:

1. After setting up Supabase, go to **Authentication** → **Users**
2. Click "Add user"
3. Create a user with:
   - **Email**: `demo@demo.com`
   - **Password**: `demo123456`
   - **Auto-confirm email**: ✅ (checked)
4. This gives you a ready-to-use demo account

## 🚨 Important Notes

- **Never commit your `.env` file** to version control
- **Service Role Key** should be kept secret - only use it server-side
- **Anon Key** is safe to use in client-side code
- For production, update the **Site URL** to your actual domain
- Remember to configure your **email templates** in Supabase settings for better branding

## 🔧 Troubleshooting

### Common Issues:

**"Invalid JWT" error**:
- Check that your Supabase URL and keys are correctly copied
- Ensure there are no extra spaces or line breaks

**Email not arriving**:
- Check spam/junk folder
- Verify email configuration in Supabase Auth settings
- Try a different email provider (Gmail, Outlook, etc.)

**Redirect not working**:
- Ensure redirect URLs are correctly configured in Supabase Auth settings
- Check that your BASE_URL in .env matches your development URL

**Build errors**:
- Make sure all three Supabase environment variables are set
- Run `pnpm build` to verify everything works

### Need Help?
- Check the Supabase documentation: https://supabase.com/docs
- Review the migration changes in your codebase
- All authentication logic is now in `lib/supabase/` and updated actions

---

**Your migration is complete! 🎉 Once you configure these Supabase credentials, your app will have modern authentication with email confirmation.**