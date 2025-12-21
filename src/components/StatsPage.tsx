import React from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  Clock, 
  Target, 
  HelpCircle, 
  TrendingUp, 
  Share2,
  Home,
  RotateCcw
} from 'lucide-react';

export function StatsPage() {
  const { state, dispatch } = useGame();
  const { gameStats, gameHistory } = state;

  const handleShare = async () => {
    const shareText = `🧠 Memory Shopping Game Results!\n\n` +
      `🎯 Accuracy: ${gameStats.accuracy}%\n` +
      `⏰ Time: ${Math.round(gameStats.timeTaken)}s\n` +
      `📋 Items: ${gameStats.itemsCorrect}/${gameStats.itemsTotal}\n` +
      `💡 Hints Used: ${gameStats.hintsUsed}\n\n` +
      `A great exercise for memory and cognitive health! 🌟`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Memory Shopping Game Results',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      } catch (err) {
        console.log('Could not copy to clipboard');
      }
    }
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const handleGoHome = () => {
    dispatch({ type: 'SET_PAGE', page: 'home' });
  };

  const getEncouragementMessage = (accuracy: number) => {
    if (accuracy >= 90) {
      return {
        message: "Outstanding performance! Your memory is sharp as ever!",
        icon: "🌟",
        color: "text-yellow-600"
      };
    } else if (accuracy >= 80) {
      return {
        message: "Excellent work! You're doing great with memory exercises!",
        icon: "🎉",
        color: "text-green-600"
      };
    } else if (accuracy >= 70) {
      return {
        message: "Great job! Practice makes perfect - keep it up!",
        icon: "👍",
        color: "text-blue-600"
      };
    } else if (accuracy >= 50) {
      return {
        message: "Good effort! Each game helps strengthen your memory!",
        icon: "💪",
        color: "text-purple-600"
      };
    } else {
      return {
        message: "Every attempt counts! Memory training takes time and practice!",
        icon: "🌱",
        color: "text-indigo-600"
      };
    }
  };

  const encouragement = getEncouragementMessage(gameStats.accuracy);

  const averageAccuracy = gameHistory.length > 0 
    ? Math.round(gameHistory.reduce((sum, game) => sum + game.accuracy, 0) / gameHistory.length)
    : gameStats.accuracy;

  const averageTime = gameHistory.length > 0
    ? Math.round(gameHistory.reduce((sum, game) => sum + game.timeTaken, 0) / gameHistory.length)
    : gameStats.timeTaken;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl mb-4 text-teal-800">Game Statistics</h1>
          <p className="text-xl text-gray-600">
            Great job completing another memory exercise!
          </p>
        </div>

        {/* Encouragement Message */}
        <Card className="p-6 mb-8 bg-white border-2 border-teal-200">
          <div className="text-center">
            <div className="text-4xl mb-3">{encouragement.icon}</div>
            <p className={`text-xl ${encouragement.color}`}>
              {encouragement.message}
            </p>
          </div>
        </Card>

        {/* Current Game Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 bg-white border-2 border-green-200">
            <div className="text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl mb-1 text-green-600">{gameStats.accuracy}%</div>
              <p className="text-gray-600">Accuracy</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-blue-200">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl mb-1 text-blue-600">{Math.round(gameStats.timeTaken)}s</div>
              <p className="text-gray-600">Time Taken</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-purple-200">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl mb-1 text-purple-600">
                {gameStats.itemsCorrect}/{gameStats.itemsTotal}
              </div>
              <p className="text-gray-600">Items Found</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-orange-200">
            <div className="text-center">
              <HelpCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl mb-1 text-orange-600">{gameStats.hintsUsed}</div>
              <p className="text-gray-600">Hints Used</p>
            </div>
          </Card>
        </div>

        {/* Progress Over Time */}
        {gameHistory.length > 0 && (
          <Card className="p-6 mb-8 bg-white border-2 border-teal-200">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-teal-600" />
              <h3 className="text-2xl text-teal-800">Your Progress</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl mb-1 text-teal-600">{gameHistory.length}</div>
                <p className="text-gray-600">Total Games</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-1 text-green-600">{averageAccuracy}%</div>
                <p className="text-gray-600">Average Accuracy</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-1 text-blue-600">{averageTime}s</div>
                <p className="text-gray-600">Average Time</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3">Recent Performance</h4>
              <div className="space-y-2">
                {gameHistory.slice(-5).reverse().map((game, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={game.accuracy >= 80 ? "default" : "secondary"}>
                        {game.accuracy}%
                      </Badge>
                      <span className="text-sm">
                        {game.itemsCorrect}/{game.itemsTotal} items
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(game.timeTaken)}s • {game.hintsUsed} hints
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Health Benefits */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="text-xl mb-4 text-purple-800">🧠 Memory Training Benefits</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-gray-700">Improves cognitive function</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-gray-700">Enhances working memory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-gray-700">Boosts attention and focus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-gray-700">Supports mental wellness</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={handleShare}
            size="lg"
            className="text-xl px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Results
          </Button>
          
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="text-xl px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Play Again
          </Button>

          <Button
            onClick={handleGoHome}
            size="lg"
            variant="outline"
            className="text-xl px-6 py-3"
          >
            <Home className="h-5 w-5 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}