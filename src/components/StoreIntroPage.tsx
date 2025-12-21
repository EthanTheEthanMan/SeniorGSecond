import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Store, ShoppingCart, ArrowRight, SkipForward } from 'lucide-react';

export function StoreIntroPage() {
  const { state, dispatch } = useGame();
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    "Welcome to our friendly neighborhood store!",
    "I'm here to help you with your shopping today.",
    `I see you need to find ${state.shoppingList.length} items for your list.`,
    "Take your time and look carefully at all the items on the shelves.",
    "Click on the items you need to add them to your basket.",
    "Good luck, and happy shopping!"
  ];

  useEffect(() => {
    if (currentMessage < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessage(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentMessage, messages.length]);

  const handleStartShopping = () => {
    dispatch({ type: 'SET_PAGE', page: 'game' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4 sm:p-6 relative">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          onClick={handleStartShopping}
          variant="outline"
          size="sm"
          className="bg-white/80 hover:bg-white border-orange-300 text-orange-700 hover:text-orange-800"
        >
          <SkipForward className="h-4 w-4 mr-2" />
          Skip Intro
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Store className="h-20 w-20 text-orange-600 mx-auto mb-4" />
          <h1 className="text-4xl mb-4 text-orange-800">Welcome to the Store!</h1>
        </div>

        {/* Shopkeeper Character */}
        <Card className="p-8 mb-8 bg-white border-2 border-orange-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full flex items-center justify-center border-4 border-orange-300">
                <div className="text-6xl">🧑‍💼</div>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl mb-4 text-orange-800">Store Manager Sam</h2>
              <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200 min-h-[120px] flex items-center">
                <p className="text-xl text-gray-700">
                  {messages[currentMessage]}
                </p>
              </div>
              
              {/* Message Progress Dots */}
              <div className="flex justify-center md:justify-start gap-2 mt-4">
                {messages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index <= currentMessage ? 'bg-orange-400' : 'bg-orange-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Shopping Reminders */}
        <Card className="p-6 mb-8 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <ShoppingCart className="h-8 w-8 text-blue-600 mt-1" />
            <div>
              <h3 className="text-xl mb-3 text-blue-800">Shopping Reminders</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2 text-lg text-gray-700">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Look for {state.shoppingList.length} items total</span>
                </div>
                <div className="flex items-center gap-2 text-lg text-gray-700">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Items are displayed on store shelves</span>
                </div>
                {state.settings.hintsEnabled && (
                  <div className="flex items-center gap-2 text-lg text-gray-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Use hints if you need help</span>
                  </div>
                )}
                {state.settings.timerEnabled && (
                  <div className="flex items-center gap-2 text-lg text-gray-700">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Complete within {state.settings.timerMinutes} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Start Shopping Button */}
        <div className="text-center">
          {currentMessage >= messages.length - 1 ? (
            <Button
              onClick={handleStartShopping}
              size="lg"
              className="text-xl px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white animate-pulse"
            >
              Start Shopping
              <ArrowRight className="h-6 w-6 ml-2" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                disabled
                size="lg"
                className="text-xl px-8 py-4"
                variant="outline"
              >
                Listening to Sam...
              </Button>
              <Button
                onClick={handleStartShopping}
                size="lg"
                className="text-xl px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white"
                variant="default"
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Skip
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}