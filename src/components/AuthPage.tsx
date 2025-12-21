import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Heart, ShoppingCart, AlertCircle, Play } from 'lucide-react';
import { signIn, signUp } from '../utils/supabase/client';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onDemoMode?: () => void;
}

export function AuthPage({ onAuthSuccess, onDemoMode }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        setSuccess('Signed in successfully!');
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (!age.trim() || isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 120) {
          setError('Please enter a valid age (1-120)');
          setLoading(false);
          return;
        }
        await signUp(email, password, name, parseInt(age));
        setSuccess('Account created and signed in successfully!');
      }
      
      // Wait a moment to show success message
      setTimeout(() => {
        onAuthSuccess();
      }, 500);
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-10 bg-white border-4 border-blue-200 shadow-2xl rounded-3xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
            <ShoppingCart className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-blue-800 mb-2">Memory Shopping Game</h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="name" className="text-gray-700 mb-2 block">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-14 text-lg border-2 border-gray-300 rounded-xl"
                  required={!isLogin}
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-gray-700 mb-2 block">
                  Your Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="h-14 text-lg border-2 border-gray-300 rounded-xl"
                  required={!isLogin}
                  min="1"
                  max="120"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email" className="text-gray-700 mb-2 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-14 text-lg border-2 border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'Enter your password' : 'Create a password'}
              className="h-14 text-lg border-2 border-gray-300 rounded-xl"
              required
              minLength={6}
            />
            {!isLogin && (
              <p className="text-gray-500 mt-2">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
              <Heart className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-blue-600 hover:text-blue-700 underline block w-full"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
          
          {!isLogin && (
            <button
              type="button"
              onClick={() => {
                setEmail('test@example.com');
                setPassword('test123');
                setName('Test User');
                setAge('72');
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Fill with test data
            </button>
          )}
        </div>

        {onDemoMode && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-gray-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onDemoMode}
              variant="outline"
              className="w-full h-14 mt-6 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-gray-500 mt-2 text-center">
              Play without an account (progress won't be saved)
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
          <p className="text-gray-700 mb-2">
            <strong>Why create an account?</strong>
          </p>
          <ul className="text-gray-600 space-y-1">
            <li>✓ Save your progress across devices</li>
            <li>✓ Track improvement over time</li>
            <li>✓ Never lose your game history</li>
            <li>✓ Share progress with caregivers</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
