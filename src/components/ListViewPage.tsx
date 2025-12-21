import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ShoppingCart, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ListViewPage() {
  const { state, dispatch } = useGame();
  const { shoppingList, settings } = state;
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to memorize the list

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          dispatch({ type: 'SET_PAGE', page: 'intro' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  const handleContinue = () => {
    dispatch({ type: 'SET_PAGE', page: 'intro' });
  };

  const progressPercentage = ((30 - timeLeft) / 30) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-green-800">Your Shopping List</h1>
          <p className="text-xl text-gray-600">
            Memorize these {shoppingList.length} items. You'll need to find them in the store!
          </p>
        </div>

        {/* Timer Section */}
        <Card className="p-6 mb-8 bg-white border-2 border-green-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="text-center">
              <div className="text-3xl text-green-600 mb-1">{timeLeft}s</div>
              <p className="text-lg text-gray-600">Time to memorize</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="w-full h-3" />
        </Card>

        {/* Shopping List Items */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {shoppingList.map((item, index) => (
            <Card key={item.id} className="p-6 bg-white border-2 border-gray-200 hover:border-green-300 transition-colors">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700">{index + 1}</span>
                  </div>
                </div>
                <h3 className="text-xl text-gray-800">{item.name}</h3>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-200 mb-8">
          <div className="flex items-start gap-4">
            <ShoppingCart className="h-8 w-8 text-blue-600 mt-1" />
            <div>
              <h3 className="text-xl mb-2 text-blue-800">Instructions</h3>
              <ul className="text-lg text-gray-700 space-y-2">
                <li>• Study these items carefully</li>
                <li>• Remember their names and how they look</li>
                <li>• You'll find them mixed with other items in the store</li>
                <li>• Click on items to add them to your basket</li>
                {settings.hintsEnabled && (
                  <li>• Use hints if you need help (limited to {settings.maxHints})</li>
                )}
                {settings.timerEnabled && (
                  <li>• Complete your shopping within {settings.timerMinutes} minutes</li>
                )}
              </ul>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="text-xl px-8 py-4 bg-green-600 hover:bg-green-700 text-white"
          >
            I'm Ready to Shop
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}