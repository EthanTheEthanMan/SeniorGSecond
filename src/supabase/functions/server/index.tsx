import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-34ba2954/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to verify user authentication
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, error: "Invalid authorization header" };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: error?.message || "Unauthorized" };
  }

  return { user, error: null };
}

// Sign up endpoint
app.post("/make-server-34ba2954/signup", async (c) => {
  try {
    const { email, password, name, age } = await c.req.json();

    if (!email || !password || !name || !age) {
      console.log('Signup validation failed: missing fields');
      return c.json({ error: "Email, password, name, and age are required" }, 400);
    }

    if (typeof age !== 'number' || age < 1 || age > 120) {
      console.log('Signup validation failed: invalid age');
      return c.json({ error: "Age must be between 1 and 120" }, 400);
    }

    if (password.length < 6) {
      console.log('Signup validation failed: password too short');
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    console.log(`Creating user with email: ${email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, age },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error from Supabase: ${error.message}`);
      
      // Provide more helpful error messages
      if (error.message.includes('already registered')) {
        return c.json({ error: "This email is already registered. Please sign in instead." }, 400);
      }
      
      return c.json({ error: error.message }, 400);
    }

    if (!data || !data.user) {
      console.log('Signup error: no user data returned');
      return c.json({ error: "Failed to create user account" }, 500);
    }

    console.log(`User created successfully: ${data.user.id}`);

    // Initialize default settings for new user
    const defaultSettings = {
      listLength: 5,
      timerEnabled: false,
      timerMinutes: 3,
      hintsEnabled: true,
      maxHints: 3
    };

    try {
      await kv.set(`user:${data.user.id}:settings`, defaultSettings);
      await kv.set(`user:${data.user.id}:games`, []);
      await kv.set(`user:${data.user.id}:profile`, { name, email, age, created_at: new Date().toISOString() });
      console.log(`User data initialized for: ${data.user.id}`);
    } catch (kvError) {
      console.log(`Warning: Failed to initialize user data: ${kvError}`);
      // Don't fail signup if KV initialization fails
    }

    return c.json({ user: data.user, message: "User created successfully" });
  } catch (error) {
    console.log(`Signup error during user creation: ${error}`);
    return c.json({ error: "Failed to create user. Please try again." }, 500);
  }
});

// Get user settings
app.get("/make-server-34ba2954/settings", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const settings = await kv.get(`user:${user.id}:settings`);
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        listLength: 5,
        timerEnabled: false,
        timerMinutes: 3,
        hintsEnabled: true,
        maxHints: 3
      };
      await kv.set(`user:${user.id}:settings`, defaultSettings);
      return c.json({ settings: defaultSettings });
    }

    return c.json({ settings });
  } catch (error) {
    console.log(`Error fetching settings for user ${user.id}: ${error}`);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// Update user settings
app.post("/make-server-34ba2954/settings", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const newSettings = await c.req.json();
    await kv.set(`user:${user.id}:settings`, newSettings);
    
    return c.json({ settings: newSettings, message: "Settings updated successfully" });
  } catch (error) {
    console.log(`Error updating settings for user ${user.id}: ${error}`);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// Get game history
app.get("/make-server-34ba2954/games", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const games = await kv.get(`user:${user.id}:games`) || [];
    return c.json({ games });
  } catch (error) {
    console.log(`Error fetching games for user ${user.id}: ${error}`);
    return c.json({ error: "Failed to fetch game history" }, 500);
  }
});

// Save a new game result
app.post("/make-server-34ba2954/games", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const gameResult = await c.req.json();
    const games = await kv.get(`user:${user.id}:games`) || [];
    
    const newGame = {
      ...gameResult,
      timestamp: new Date().toISOString()
    };
    
    games.push(newGame);
    await kv.set(`user:${user.id}:games`, games);
    
    return c.json({ game: newGame, message: "Game saved successfully" });
  } catch (error) {
    console.log(`Error saving game for user ${user.id}: ${error}`);
    return c.json({ error: "Failed to save game" }, 500);
  }
});

// Get user profile
app.get("/make-server-34ba2954/profile", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const profile = await kv.get(`user:${user.id}:profile`);
    return c.json({ profile: profile || { name: user.user_metadata?.name, email: user.email } });
  } catch (error) {
    console.log(`Error fetching profile for user ${user.id}: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Admin endpoint - Get all users with their data
app.get("/make-server-34ba2954/admin/users", async (c) => {
  const { user, error } = await getUserFromToken(c.req.header('Authorization'));
  
  if (error || !user) {
    return c.json({ error: error || "Unauthorized" }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get all users from Supabase Auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log(`Error fetching users: ${usersError.message}`);
      return c.json({ error: "Failed to fetch users" }, 500);
    }

    // Get profile and game data for each user
    const usersWithData = await Promise.all(
      users.map(async (authUser) => {
        try {
          const profile = await kv.get(`user:${authUser.id}:profile`) || {};
          const games = await kv.get(`user:${authUser.id}:games`) || [];
          
          // Calculate statistics
          const totalGames = games.length;
          const avgAccuracy = totalGames > 0 
            ? Math.round(games.reduce((sum: number, game: any) => sum + (game.accuracy || 0), 0) / totalGames)
            : 0;
          const lastPlayed = totalGames > 0 
            ? games[games.length - 1]?.timestamp 
            : null;
          
          return {
            id: authUser.id,
            email: authUser.email,
            name: profile.name || authUser.user_metadata?.name || 'Unknown',
            age: profile.age || authUser.user_metadata?.age || null,
            created_at: profile.created_at || authUser.created_at,
            totalGames,
            avgAccuracy,
            lastPlayed,
            recentGames: games.slice(-5).reverse(), // Last 5 games
          };
        } catch (err) {
          console.log(`Error fetching data for user ${authUser.id}: ${err}`);
          return {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'Unknown',
            age: authUser.user_metadata?.age || null,
            created_at: authUser.created_at,
            totalGames: 0,
            avgAccuracy: 0,
            lastPlayed: null,
            recentGames: [],
          };
        }
      })
    );

    // Sort by created date (newest first)
    usersWithData.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ users: usersWithData });
  } catch (error) {
    console.log(`Error in admin users endpoint: ${error}`);
    return c.json({ error: "Failed to fetch users data" }, 500);
  }
});

Deno.serve(app.fetch);
