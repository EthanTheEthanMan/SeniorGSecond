import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ShoppingBasket, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function GamePage() {
  const { state, dispatch } = useGame();
  const { 
    availableItems, 
    selectedItems, 
    shoppingList, 
    settings, 
    hintsUsed, 
    timeStarted,
    lastHintTime 
  } = state;
  
  const [gameTimeLeft, setGameTimeLeft] = useState(settings.timerMinutes * 60);

  // Reset timer when page loads
  useEffect(() => {
    if (timeStarted) {
      setGameTimeLeft(settings.timerMinutes * 60);
    }
  }, [timeStarted, settings.timerMinutes]);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [hintCooldown, setHintCooldown] = useState(0);

  // Game timer
  useEffect(() => {
    if (!settings.timerEnabled || !timeStarted) return;

    const timer = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          dispatch({ type: 'FINISH_GAME' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.timerEnabled, timeStarted, dispatch]);

  // Hint cooldown timer
  useEffect(() => {
    if (lastHintTime === 0) {
      setHintCooldown(0);
      return;
    }

    const updateCooldown = () => {
      const timeSinceHint = Date.now() - lastHintTime;
      const remainingCooldown = Math.max(0, 5000 - timeSinceHint);
      setHintCooldown(Math.ceil(remainingCooldown / 1000));
      
      if (remainingCooldown > 0) {
        setTimeout(updateCooldown, 1000);
      }
    };
    
    updateCooldown();
  }, [lastHintTime]);

  const handleItemClick = (item: any) => {
    const isSelected = selectedItems.find(selected => selected.id === item.id);
    
    if (isSelected) {
      dispatch({ type: 'DESELECT_ITEM', itemId: item.id });
    } else {
      dispatch({ type: 'SELECT_ITEM', item });
    }
  };

  const handleUseHint = () => {
    if (hintsUsed >= settings.maxHints || hintCooldown > 0) return;

    const unselectedRequired = shoppingList.filter(required => 
      !selectedItems.find(selected => selected.id === required.id)
    );

    if (unselectedRequired.length > 0) {
      const randomItem = unselectedRequired[Math.floor(Math.random() * unselectedRequired.length)];
      setShowHint(randomItem.name);
      dispatch({ type: 'USE_HINT' });

      setTimeout(() => setShowHint(null), 3000);
    }
  };

  const handleFinishShopping = () => {
    dispatch({ type: 'FINISH_GAME' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = settings.timerEnabled ? 
    ((settings.timerMinutes * 60 - gameTimeLeft) / (settings.timerMinutes * 60)) * 100 : 0;



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {/* Timer */}
          {settings.timerEnabled && (
            <Card className="p-6 bg-gradient-to-br from-purple-100 to-purple-50 border-4 border-purple-300 shadow-xl rounded-2xl">
              <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-purple-600" />
                <div className="flex-1">
                  <div className="text-purple-700 mb-2">{formatTime(gameTimeLeft)}</div>
                  <Progress value={timePercentage} className="w-full h-4" />
                </div>
              </div>
            </Card>
          )}

          {/* Shopping Progress */}
          <Card className="p-4 bg-white border-2 border-green-200">
            <div className="flex items-center gap-3">
              <ShoppingBasket className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-2xl text-green-700">
                  {selectedItems.length} / {shoppingList.length}
                </div>
                <p className="text-sm text-gray-600">Items collected</p>
              </div>
            </div>
          </Card>

          {/* Hints */}
          {settings.hintsEnabled && (
            <Card className="p-4 bg-white border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="text-2xl text-blue-700">
                      {settings.maxHints - hintsUsed}
                    </div>
                    <p className="text-sm text-gray-600">Hints left</p>
                  </div>
                </div>
                <Button
                  onClick={handleUseHint}
                  disabled={hintsUsed >= settings.maxHints || hintCooldown > 0}
                  size="sm"
                  variant={hintCooldown > 0 ? "outline" : "default"}
                >
                  {hintCooldown > 0 ? `${hintCooldown}s` : 'Hint'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Hint Display */}
        {showHint && (
          <Card className="p-4 mb-6 bg-yellow-50 border-2 border-yellow-200 animate-pulse">
            <div className="flex items-center gap-3 text-center justify-center">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <p className="text-lg text-yellow-800">
                Look for: <strong>{showHint}</strong>
              </p>
            </div>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Store Shelves - Responsive Grid */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-white border-4 border-gray-300 shadow-xl rounded-2xl">
              <h2 className="mb-4 text-center text-gray-800">🏪 Grocery Store</h2>
              <p className="mb-8 text-center text-gray-600">
                {availableItems.length} items available (Need: {shoppingList.length})
              </p>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {availableItems.map((item) => {
                  const isSelected = selectedItems.find(selected => selected.id === item.id);
                  const isRequired = shoppingList.find(required => required.id === item.id);
                  
                  return (
                    <Card
                      key={item.id}
                      className={`p-4 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                        isSelected 
                          ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-400 border-4 shadow-xl ring-2 ring-green-300' 
                          : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 border-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                      } rounded-2xl`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-white shadow-md">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-sm md:text-base mb-2 px-1 leading-tight">{item.name}</h3>
                        {isSelected && (
                          <div className="flex justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600 animate-bounce" />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Shopping Basket */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-4 border-orange-300 shadow-xl rounded-2xl sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBasket className="h-8 w-8 text-orange-600" />
                <h3 className="text-orange-800">🛒 Your Basket</h3>
              </div>

              <div className="space-y-3 mb-6">
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Your basket is empty
                  </p>
                ) : (
                  selectedItems.map((item) => {
                    const isCorrect = shoppingList.find(required => required.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                          isCorrect 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 border-green-300' 
                            : 'bg-gradient-to-r from-red-100 to-red-50 border-red-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="flex-1 leading-snug">{item.name}</span>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <Button
                onClick={handleFinishShopping}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg rounded-xl transition-all duration-200 hover:shadow-xl"
                disabled={selectedItems.length === 0}
              >
                🛍️ Done Shopping
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}