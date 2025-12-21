# Export Instructions for Figma Make

## How to Export Your Code

Since you're currently in Figma Make, here's how to export your entire project:

### Method 1: Manual File-by-File Export

1. **Download Each File**: In Figma Make, you can typically download files individually
2. **Recreate Directory Structure**: Create folders on your computer matching this structure:

```
grocery-memory-game/
├── components/
│   ├── ui/
│   │   └── [all ui component files]
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   ├── AdminDashboard.tsx
│   ├── AuthPage.tsx
│   ├── GameContext.tsx
│   ├── GamePage.tsx
│   ├── HomePage.tsx
│   ├── ListViewPage.tsx
│   ├── ResultsPage.tsx
│   ├── StatsPage.tsx
│   └── StoreIntroPage.tsx
├── lib/
│   ├── supabase.ts
│   └── supabaseService.ts
├── styles/
│   └── globals.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
├── utils/
│   └── supabase/
│       ├── client.ts
│       └── info.tsx
├── .env.example
├── .gitignore
├── App.tsx
├── DEPLOYMENT.md
├── index.html
├── main.tsx
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Method 2: Copy-Paste into Local Project

1. **Create New Project Locally**:
   ```bash
   mkdir grocery-memory-game
   cd grocery-memory-game
   ```

2. **Copy Configuration Files** (already created for you):
   - `package.json` - Dependencies and scripts
   - `vite.config.ts` - Vite configuration
   - `tsconfig.json` - TypeScript configuration
   - `index.html` - Entry HTML file
   - `main.tsx` - React entry point
   - `.gitignore` - Files to ignore in git
   - `.env.example` - Environment variable template

3. **Copy Source Files**:
   - All files from `/components/`
   - All files from `/lib/`
   - All files from `/styles/`
   - All files from `/supabase/`
   - All files from `/utils/`
   - `App.tsx`

4. **Install Dependencies**:
   ```bash
   npm install
   ```

## Files List to Export

### Configuration Files (✅ Already Created)
- [x] `package.json` - All dependencies listed
- [x] `vite.config.ts` - Build configuration
- [x] `tsconfig.json` - TypeScript settings
- [x] `tsconfig.node.json` - Node TypeScript settings
- [x] `index.html` - Entry point
- [x] `main.tsx` - React mount
- [x] `.env.example` - Environment template
- [x] `.gitignore` - Git ignore rules
- [x] `README.md` - Full documentation
- [x] `DEPLOYMENT.md` - Deployment guide

### Source Files (Already in Your Project)
- [ ] `App.tsx`
- [ ] `components/AdminDashboard.tsx`
- [ ] `components/AuthPage.tsx`
- [ ] `components/GameContext.tsx`
- [ ] `components/GamePage.tsx`
- [ ] `components/HomePage.tsx`
- [ ] `components/ListViewPage.tsx`
- [ ] `components/ResultsPage.tsx`
- [ ] `components/StatsPage.tsx`
- [ ] `components/StoreIntroPage.tsx`
- [ ] `components/figma/ImageWithFallback.tsx`
- [ ] All 40+ files in `components/ui/`
- [ ] `lib/supabase.ts`
- [ ] `lib/supabaseService.ts`
- [ ] `styles/globals.css`
- [ ] `supabase/functions/server/index.tsx`
- [ ] `supabase/functions/server/kv_store.tsx`
- [ ] `utils/supabase/client.ts`
- [ ] `utils/supabase/info.tsx`

## Quick Start After Export

Once you have all files locally:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials
# (Follow DEPLOYMENT.md for getting these)

# 4. Run development server
npm run dev

# 5. Open browser to http://localhost:5173
```

## Next Steps

1. **Read README.md** - Complete overview of the project
2. **Read DEPLOYMENT.md** - Step-by-step deployment guide
3. **Set up Supabase** - Create your backend (15 minutes)
4. **Deploy to Vercel** - Get it live (10 minutes)

## File Sizes Reference

Your project structure breakdown:
- **Total Files**: ~60 files
- **Components**: 53 files (including 40+ UI components)
- **Configuration**: 7 files
- **Documentation**: 3 files
- **Backend**: 2 files (edge functions)
- **Total Lines of Code**: ~5,000+ lines

## Important Notes

### Before Export
- ✅ All components are self-contained
- ✅ No external dependencies on Figma Make
- ✅ All images use Unsplash (no local assets needed)
- ✅ Backend uses standard Supabase (portable)

### After Export
1. **Update Supabase credentials** in `/utils/supabase/info.tsx`
2. **Create `.env.local`** with your Supabase keys
3. **Deploy edge functions** to your Supabase project
4. **Test locally** before deploying to production

### File Renaming Required

When deploying edge functions:
- Rename: `index.tsx` → `index.ts`
- Rename: `kv_store.tsx` → `kv_store.ts`
- Move from: `/supabase/functions/server/`
- Move to: `/supabase/functions/make-server-34ba2954/`

This is because Supabase Edge Functions use Deno and expect `.ts` files.

## Verification Checklist

After exporting, verify you have:
- [ ] All component files (check components/ folder)
- [ ] All UI components (check components/ui/)
- [ ] Backend files (check supabase/functions/)
- [ ] Style files (check styles/)
- [ ] Configuration files (package.json, tsconfig.json, etc.)
- [ ] Documentation (README.md, DEPLOYMENT.md)
- [ ] No Figma Make-specific imports or dependencies

## Need Help?

If you're stuck:
1. Check that all files are copied
2. Verify file structure matches the tree above
3. Run `npm install` to ensure dependencies are installed
4. Check for any import errors (missing files)
5. Refer to README.md troubleshooting section

---

**You're all set!** Once exported, you'll have a fully portable, deployable web application. 🚀
