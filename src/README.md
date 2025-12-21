# Grocery Memory Game for Seniors

A senior-friendly memory game designed for Alzheimer's patients that simulates a grocery shopping experience to help with cognitive exercise.

## Features

- **Six Distinct Game Pages**: Home, List Memorization, Store Introduction, Shopping Game, Results Comparison, Stats
- **Customizable Settings**: List length (3-10 items), timer toggle, hints system
- **Accessibility First**: Large fonts, high contrast colors, clear visual feedback
- **User Authentication**: Secure signup/login with age validation
- **Cloud Sync**: Automatic data syncing across devices via Supabase
- **Admin Dashboard**: Monitor user progress and statistics
- **Demo Mode**: Test without creating an account

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Icons**: Lucide React
- **Images**: Unsplash API

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- Unsplash API key (optional, for custom images)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (2-3 minutes)
3. Go to Project Settings → API to get your keys

### 3. Create Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up the Database

The app uses a key-value store table. In your Supabase project:

1. Go to SQL Editor
2. Run this SQL to create the table:

```sql
CREATE TABLE IF NOT EXISTS kv_store_34ba2954 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE kv_store_34ba2954 ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role has full access"
  ON kv_store_34ba2954
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 5. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy make-server-34ba2954 --no-verify-jwt

# Set environment variables for the function
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
```

**Note**: The edge function is in `/supabase/functions/server/`. You'll need to restructure it slightly:
- Move `/supabase/functions/server/index.tsx` to `/supabase/functions/make-server-34ba2954/index.ts`
- Move `/supabase/functions/server/kv_store.tsx` to `/supabase/functions/make-server-34ba2954/kv_store.ts`

### 6. Update API Endpoints

Update `/utils/supabase/info.tsx` with your Supabase credentials:

```typescript
export const projectId = 'your-project-ref';
export const publicAnonKey = 'your-anon-key';
```

### 7. Run Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Production Deployment

### Deploy Frontend (Vercel - Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Alternative: Netlify

1. Push code to GitHub
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Deploy Backend (Supabase)

Already done if you followed step 5 above!

## Configuration

### Email Authentication

By default, emails are auto-confirmed. To enable email verification:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize your confirmation email template
3. Remove `email_confirm: true` from `/supabase/functions/make-server-34ba2954/index.ts` line 86

### Social Login (Optional)

To enable Google/Facebook login:

1. Follow [Supabase Social Login Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
2. Configure OAuth providers in Supabase Dashboard
3. The code already supports social login

## Project Structure

```
/
├── components/
│   ├── AdminDashboard.tsx      # Admin user management
│   ├── AuthPage.tsx            # Login/signup
│   ├── GameContext.tsx         # Game state management
│   ├── GamePage.tsx            # Main shopping game
│   ├── HomePage.tsx            # Settings and start screen
│   ├── ListViewPage.tsx        # Memorization phase
│   ├── ResultsPage.tsx         # Comparison results
│   ├── StatsPage.tsx           # Final statistics
│   ├── StoreIntroPage.tsx      # Store introduction
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── supabase.ts             # Supabase client utilities
│   └── supabaseService.ts      # Service role client
├── supabase/functions/server/
│   ├── index.tsx               # API routes
│   └── kv_store.tsx            # KV store utilities
├── styles/
│   └── globals.css             # Global styles & typography
├── utils/supabase/
│   ├── client.ts               # Frontend Supabase client
│   └── info.tsx                # Project credentials
└── App.tsx                     # Main app component
```

## Admin Access

The admin dashboard is accessible from the home page. Any authenticated user can view the dashboard. For production, you may want to add admin role checking.

## Game Flow

1. **Home Page**: Configure settings (list length, timer, hints)
2. **List View**: Memorize grocery items (countdown)
3. **Store Intro**: Meet the shopkeeper
4. **Shopping Game**: Select items from 3x3 shelf grid
5. **Results**: Compare selected vs. original list
6. **Stats**: View accuracy, time, and encouragement

## Accessibility Features

- Large font sizes (24px base)
- High contrast colors
- Clear button labels
- Visual feedback on interactions
- Simple, uncluttered layouts
- Progressive difficulty settings

## Troubleshooting

### CORS Errors
- Ensure your Supabase URL is correct in environment variables
- Check that edge function is deployed properly

### Authentication Issues
- Verify Supabase keys are correct
- Check browser console for specific errors
- Ensure email confirmation is configured

### Images Not Loading
- Unsplash images may be blocked by ad blockers
- Check network tab for failed requests
- Consider hosting your own images

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs in Dashboard → Edge Functions → Logs
3. Verify all environment variables are set correctly

## License

This project is open source and available for educational and therapeutic use.

## Acknowledgments

- Built for Alzheimer's patients and senior cognitive exercise
- Images from Unsplash
- UI components from shadcn/ui
