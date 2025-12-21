# Deployment Guide

This guide will help you deploy the Grocery Memory Game to production.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] GitHub account (for Vercel/Netlify deployment)
- [ ] Supabase CLI installed: `npm install -g supabase`

## Step-by-Step Deployment

### Part 1: Supabase Backend Setup (15 minutes)

#### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: grocery-memory-game
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project to initialize

#### 1.2 Get Your Credentials

1. Go to Project Settings → API
2. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project Ref**: `xxxxx` (from the URL)
   - **anon/public key**: `eyJhbG...` (long string)
   - **service_role key**: `eyJhbG...` (different long string)

⚠️ **IMPORTANT**: Never expose service_role key in frontend code!

#### 1.3 Create Database Table

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Paste this SQL:

```sql
-- Create the key-value store table
CREATE TABLE IF NOT EXISTS kv_store_34ba2954 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store_34ba2954(key);

-- Enable Row Level Security
ALTER TABLE kv_store_34ba2954 ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (used by Edge Functions)
CREATE POLICY "Service role has full access"
  ON kv_store_34ba2954
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_kv_store_updated_at
  BEFORE UPDATE ON kv_store_34ba2954
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" (or press Cmd+Enter)
5. You should see "Success. No rows returned"

#### 1.4 Prepare Edge Function Files

The Supabase CLI expects a specific structure. Create this locally:

```bash
# Create proper directory structure
mkdir -p supabase/functions/make-server-34ba2954

# Copy your files (you'll need to rename .tsx to .ts)
# From: /supabase/functions/server/index.tsx
# To: supabase/functions/make-server-34ba2954/index.ts

# From: /supabase/functions/server/kv_store.tsx  
# To: supabase/functions/make-server-34ba2954/kv_store.ts
```

**Important**: Change file extensions from `.tsx` to `.ts`

#### 1.5 Deploy Edge Function

```bash
# Login to Supabase
supabase login

# Link to your project (use Project Ref from step 1.2)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy make-server-34ba2954 --no-verify-jwt

# Set environment secrets for the function
supabase secrets set SUPABASE_URL="https://xxxxx.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
```

#### 1.6 Test Edge Function

```bash
# Test the health endpoint
curl https://your-project-ref.supabase.co/functions/v1/make-server-34ba2954/health
# Should return: {"status":"ok"}
```

✅ Backend is now deployed!

---

### Part 2: Frontend Deployment (10 minutes)

#### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/grocery-memory-game.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - Click "Deploy"

3. **Wait 2-3 minutes** for deployment

✅ Your app is live at `https://your-app.vercel.app`!

#### Option B: Deploy to Netlify

1. **Push to GitHub** (same as Option A, step 1)

2. **Deploy on Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add Environment Variables:
     - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - Click "Deploy"

✅ Your app is live at `https://your-app.netlify.app`!

---

### Part 3: Update Frontend Configuration

#### 3.1 Update Supabase Info File

Edit `/utils/supabase/info.tsx`:

```typescript
// Replace with your actual values
export const projectId = 'your-project-ref'; // e.g., 'abcdefghijk'
export const publicAnonKey = 'your-anon-key'; // Long eyJ... string
```

#### 3.2 Commit and Push

```bash
git add utils/supabase/info.tsx
git commit -m "Update Supabase credentials"
git push
```

Vercel/Netlify will auto-redeploy with the changes.

---

### Part 4: Configure Authentication (Optional)

#### 4.1 Email Settings

By default, emails are auto-confirmed. To enable real email verification:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Go to "Email Templates" → "Confirm signup"
4. Customize the template
5. Update edge function code (remove `email_confirm: true` on line 86)

#### 4.2 Google OAuth (Optional)

To enable "Sign in with Google":

1. Follow: https://supabase.com/docs/guides/auth/social-login/auth-google
2. Get OAuth credentials from Google Cloud Console
3. Add to Supabase → Authentication → Providers → Google
4. Enable Google provider
5. Add authorized redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

No code changes needed - already supported!

---

## Verification Checklist

After deployment, test these:

- [ ] Can visit the live URL
- [ ] Home page loads with settings
- [ ] Can create a new account
- [ ] Can sign in with created account
- [ ] Settings save and persist
- [ ] Can play a complete game
- [ ] Game results save to history
- [ ] Stats page shows data
- [ ] Admin dashboard loads (from home page button)
- [ ] Admin dashboard shows user data
- [ ] Demo mode works (without login)

---

## Troubleshooting

### "Failed to fetch" errors
- Check environment variables are set correctly
- Verify Supabase URL doesn't have trailing slash
- Check browser console for CORS errors

### "Unauthorized" errors
- Verify anon key is correct
- Check edge function has correct secrets set
- Test edge function health endpoint

### Edge function not working
```bash
# Check function logs
supabase functions logs make-server-34ba2954

# Redeploy
supabase functions deploy make-server-34ba2954 --no-verify-jwt
```

### Build fails on Vercel/Netlify
- Check Node version is 18+
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**Supabase:**
1. Go to Project Settings → API → Custom Domains
2. Follow instructions to add custom domain

### Monitoring

- **Frontend**: Check Vercel/Netlify analytics
- **Backend**: Supabase Dashboard → Logs → Edge Functions
- **Database**: Supabase Dashboard → Database → Tables

### Backup Strategy

Supabase auto-backs up daily. To export:
1. Go to Database → Backups
2. Download backup
3. Store securely

---

## Costs

- **Supabase Free Tier**: 
  - 50,000 monthly active users
  - 500 MB database
  - 2 GB file storage
  - 2 GB bandwidth

- **Vercel Free Tier**:
  - 100 GB bandwidth/month
  - Unlimited deployments

Both sufficient for small to medium usage. Monitor as you grow.

---

## Support

If you encounter issues:

1. Check browser console (F12)
2. Check Supabase Edge Function logs
3. Verify all environment variables
4. Test backend health endpoint
5. Review this guide's troubleshooting section

---

## Security Notes

✅ **Safe to expose:**
- Supabase URL
- Supabase anon/public key
- Vercel/Netlify URLs

❌ **NEVER expose:**
- Supabase service_role key (only in edge functions)
- Database password
- Any API keys in frontend code

---

Congratulations! Your app is now live! 🎉
