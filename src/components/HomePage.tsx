import React from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { BarChart3, Clock, HelpCircle, Trophy, Settings, Heart, LogOut, AlertCircle, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { signOut } from '../utils/supabase/client';

interface HomePageProps {
  isDemoMode?: boolean;
  onShowAdmin?: () => void;
}

export function HomePage({ isDemoMode = false, onShowAdmin }: HomePageProps) {
  const { state, dispatch } = useGame();
  const { settings, gameHistory } = state;

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  const updateSettings = (key: keyof typeof settings, value: any) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: { [key]: value } });
  };

  const averageAccuracy = gameHistory.length > 0 
    ? Math.round(gameHistory.reduce((sum, game) => sum + game.accuracy, 0) / gameHistory.length)
    : 0;

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {isDemoMode && (
          <div className="mb-6 p-4 bg-purple-100 border-2 border-purple-300 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-purple-700 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-purple-900">
                <strong>Demo Mode:</strong> You're playing without an account. Your progress won't be saved. Create an account to save your history!
              </p>
            </div>
          </div>
        )}
        {!isDemoMode && (
          <div className="flex justify-end gap-3 mb-4">
            {onShowAdmin && (
              <Button
                onClick={onShowAdmin}
                variant="outline"
                className="flex items-center gap-2 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Heart className="h-16 w-16 text-pink-500" />
            <h1 className="text-blue-800">Memory Shopping Game</h1>
            <Heart className="h-16 w-16 text-pink-500" />
          </div>
          <p className="text-gray-700 mb-4">
            Exercise your memory by remembering and finding items in the store
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Game Settings */}
          <Card className="p-10 bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-blue-300 shadow-lg bg-white p-2">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1621319332247-ce870cdad56c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGdhbWVzJTIwc2V0dGluZ3MlMjBnZWFyfGVufDF8fHx8MTc1ODQxNzY0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Game settings"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-blue-800">Game Settings</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-300 bg-white p-1">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1513710281312-7a43f9cdbfcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwc2hvcHBpbmclMjBsaXN0JTIwcGFwZXIlMjBub3RlfGVufDF8fHx8MTc1ODQxNzYyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Shopping list"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <Label className="text-green-800">
                    Shopping List Size: {settings.listLength} items
                  </Label>
                </div>
                <Slider
                  value={[settings.listLength]}
                  onValueChange={([value]) => updateSettings('listLength', value)}
                  min={3}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-gray-600 mt-3">
                  <span>3 items</span>
                  <span>10 items</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300 bg-white p-1">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1754487436530-11d3140ec634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMGFsYXJtJTIwY2xvY2slMjB0aW1lcnxlbnwxfHx8fDE3NTg0MTc2MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Timer clock"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <Label className="text-purple-800">Timer</Label>
                      <p className="text-gray-600">Time limit for shopping</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.timerEnabled}
                    onCheckedChange={(checked) => updateSettings('timerEnabled', checked)}
                  />
                </div>
              </div>

              {settings.timerEnabled && (
                <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100 mt-4">
                  <Label className="text-purple-800 mb-4 block">
                    Time Limit: {settings.timerMinutes} minutes
                  </Label>
                  <Slider
                    value={[settings.timerMinutes]}
                    onValueChange={([value]) => updateSettings('timerMinutes', value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-gray-600 mt-3">
                    <span>1 minute</span>
                    <span>10 minutes</span>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-300 bg-white p-1">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1565516424918-cb83feb00c48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZCUyMGxpZ2h0YnVsYiUyMGlkZWF8ZW58MXx8fHwxNzU4NDE3NjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Help hints"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <Label className="text-yellow-800">Hints</Label>
                      <p className="text-gray-600">Get help during the game</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.hintsEnabled}
                    onCheckedChange={(checked) => updateSettings('hintsEnabled', checked)}
                  />
                </div>
              </div>

              {settings.hintsEnabled && (
                <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-100 mt-4">
                  <Label className="text-yellow-800 mb-4 block">
                    Maximum Hints: {settings.maxHints}
                  </Label>
                  <Slider
                    value={[settings.maxHints]}
                    onValueChange={([value]) => updateSettings('maxHints', value)}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-gray-600 mt-3">
                    <span>1 hint</span>
                    <span>5 hints</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Game History */}
          <Card className="p-10 bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-orange-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-yellow-300 shadow-lg bg-white p-2">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1706340674031-acaaf6e2144b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMHRyb3BoeSUyMGF3YXJkfGVufDF8fHx8MTc1ODQxNzYzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Trophy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-orange-800">Your Progress</h2>
            </div>

            {gameHistory.length > 0 ? (
              <div className="space-y-8">
                <div className="text-center bg-white rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                  <div className="text-green-600 mb-4">{averageAccuracy}%</div>
                  <p className="text-gray-700">Average Accuracy</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-white rounded-2xl border-2 border-blue-200 shadow-lg">
                    <div className="text-blue-600">{gameHistory.length}</div>
                    <p className="text-gray-600">Games Played</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg">
                    <div className="text-green-600">
                      {gameHistory.filter(g => g.accuracy >= 80).length}
                    </div>
                    <p className="text-gray-600">Great Scores (80%+)</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                  <h3 className="mb-6 text-gray-800">Recent Games</h3>
                  <div className="space-y-4">
                    {gameHistory.slice(-3).reverse().map((game, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={game.accuracy >= 80 ? "default" : "secondary"}
                            className="text-lg px-3 py-1"
                          >
                            {game.accuracy}%
                          </Badge>
                          <span className="text-gray-700">
                            {game.itemsCorrect}/{game.itemsTotal} items
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {Math.round(game.timeTaken)}s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                <BarChart3 className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <p className="text-gray-600 mb-4">No games played yet</p>
                <p className="text-gray-500">
                  Start your first game to see your progress here
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Start Game Button */}
        <div className="text-center mt-12">
          <Button
            onClick={handleStartGame}
            size="lg"
            className="px-16 py-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 border-4 border-green-300"
          >
            🛒 Start New Game 🎮
          </Button>
        </div>
      </div>
    </div>
  );
}
