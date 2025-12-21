import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './components/GameContext';
import { HomePage } from './components/HomePage';
import { ListViewPage } from './components/ListViewPage';
import { StoreIntroPage } from './components/StoreIntroPage';
import { GamePage } from './components/GamePage';
import { ResultsPage } from './components/ResultsPage';
import { StatsPage } from './components/StatsPage';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { supabase } from './utils/supabase/client';
import { User } from '@supabase/supabase-js';

function GameRouter({ isDemoMode, showAdmin, setShowAdmin }: { 
  isDemoMode: boolean; 
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
}) {
  const { state, isLoading, loadUserData } = useGame();

  useEffect(() => {
    // Only load user data if not in demo mode
    if (!isDemoMode) {
      loadUserData();
    }
  }, [isDemoMode]);

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  if (isLoading && !isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your game data...</p>
        </div>
      </div>
    );
  }

  switch (state.currentPage) {
    case 'home':
      return <HomePage isDemoMode={isDemoMode} onShowAdmin={() => setShowAdmin(true)} />;
    case 'list':
      return <ListViewPage />;
    case 'intro':
      return <StoreIntroPage />;
    case 'game':
      return <GamePage />;
    case 'results':
      return <ResultsPage />;
    case 'stats':
      return <StatsPage />;
    default:
      return <HomePage isDemoMode={isDemoMode} onShowAdmin={() => setShowAdmin(true)} />;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setDemoMode(false); // Exit demo mode when user logs in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !demoMode) {
    return (
      <AuthPage 
        onAuthSuccess={() => {}} 
        onDemoMode={() => setDemoMode(true)}
      />
    );
  }

  return (
    <GameProvider isDemoMode={demoMode}>
      <div className="min-h-screen">
        <GameRouter 
          isDemoMode={demoMode} 
          showAdmin={showAdmin}
          setShowAdmin={setShowAdmin}
        />
      </div>
    </GameProvider>
  );
}
