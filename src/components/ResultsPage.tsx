import React from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ResultsPage() {
  const { state, dispatch } = useGame();
  const { selectedItems, shoppingList, gameStats } = state;

  const correctItems = selectedItems.filter(selected => 
    shoppingList.find(required => required.id === selected.id)
  );

  const incorrectItems = selectedItems.filter(selected => 
    !shoppingList.find(required => required.id === selected.id)
  );

  const missedItems = shoppingList.filter(required => 
    !selectedItems.find(selected => selected.id === required.id)
  );

  const handleViewStats = () => {
    dispatch({ type: 'SAVE_GAME_RESULT' });
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-indigo-800">Shopping Complete!</h1>
          <p className="text-xl text-gray-600">
            Let's see how you did with your shopping list
          </p>
        </div>

        {/* Overall Score */}
        <Card className="p-8 mb-8 bg-white border-2 border-indigo-200">
          <div className="text-center">
            <div className="text-6xl mb-4 text-indigo-600">{gameStats.accuracy}%</div>
            <h2 className="text-2xl mb-2 text-gray-800">Accuracy Score</h2>
            <p className="text-lg text-gray-600">
              You found {gameStats.itemsCorrect} out of {gameStats.itemsTotal} required items
            </p>
            
            {gameStats.accuracy >= 90 && (
              <div className="mt-4">
                <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800">
                  🌟 Excellent Memory!
                </Badge>
              </div>
            )}
            {gameStats.accuracy >= 70 && gameStats.accuracy < 90 && (
              <div className="mt-4">
                <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                  👍 Great Job!
                </Badge>
              </div>
            )}
            {gameStats.accuracy >= 50 && gameStats.accuracy < 70 && (
              <div className="mt-4">
                <Badge className="text-lg px-4 py-2 bg-yellow-100 text-yellow-800">
                  👌 Good Try!
                </Badge>
              </div>
            )}
            {gameStats.accuracy < 50 && (
              <div className="mt-4">
                <Badge className="text-lg px-4 py-2 bg-purple-100 text-purple-800">
                  💪 Keep Practicing!
                </Badge>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Correct Items */}
          <Card className="p-6 bg-green-50 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-xl text-green-800">
                Correct Items ({correctItems.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {correctItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No correct items found
                </p>
              ) : (
                correctItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Incorrect Items */}
          <Card className="p-6 bg-red-50 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl text-red-800">
                Incorrect Items ({incorrectItems.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {incorrectItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No incorrect items picked
                </p>
              ) : (
                incorrectItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Missed Items */}
          <Card className="p-6 bg-orange-50 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-orange-200 flex items-center justify-center">
                <span className="text-orange-600 text-sm">?</span>
              </div>
              <h3 className="text-xl text-orange-800">
                Missed Items ({missedItems.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {missedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No items missed!
                </p>
              ) : (
                missedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center">
                      <span className="text-orange-600 text-xs">!</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <Button
            onClick={handleViewStats}
            size="lg"
            className="text-xl px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            View Detailed Stats
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
          <Button
            onClick={handlePlayAgain}
            size="lg"
            variant="outline"
            className="text-xl px-8 py-4"
          >
            <RotateCcw className="h-6 w-6 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}