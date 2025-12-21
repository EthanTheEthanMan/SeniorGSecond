import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { getUserSettings, updateUserSettings, getGameHistory, saveGameResult } from '../utils/supabase/client';

export interface GroceryItem {
  id: string;
  name: string;
  image: string;
}

export interface GameSettings {
  listLength: number;
  timerEnabled: boolean;
  timerMinutes: number;
  hintsEnabled: boolean;
  maxHints: number;
}

export interface GameStats {
  accuracy: number;
  timeTaken: number;
  hintsUsed: number;
  itemsCorrect: number;
  itemsTotal: number;
}

export interface GameState {
  currentPage: 'home' | 'list' | 'intro' | 'game' | 'results' | 'stats';
  settings: GameSettings;
  shoppingList: GroceryItem[];
  availableItems: GroceryItem[];
  selectedItems: GroceryItem[];
  gameStats: GameStats;
  gameHistory: GameStats[];
  hintsUsed: number;
  timeStarted: number | null;
  lastHintTime: number;
}

type GameAction =
  | { type: 'SET_PAGE'; page: GameState['currentPage'] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'START_GAME' }
  | { type: 'SELECT_ITEM'; item: GroceryItem }
  | { type: 'DESELECT_ITEM'; itemId: string }
  | { type: 'USE_HINT' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SAVE_GAME_RESULT' }
  | { type: 'LOAD_SETTINGS'; settings: GameSettings }
  | { type: 'LOAD_HISTORY'; history: GameStats[] };

const GROCERY_ITEMS: GroceryItem[] = [
  // Fresh Fruits
  { id: '1', name: 'Apples', image: 'https://images.unsplash.com/photo-1680835011462-d30471faf688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGFwcGxlcyUyMGZydWl0fGVufDF8fHx8MTc1NzE1ODY5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '4', name: 'Bananas', image: 'https://images.unsplash.com/photo-1573828235229-fb27fdc8da91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJhbmFuYXMlMjBmcnVpdHxlbnwxfHx8fDE3NTcxNjI0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '23', name: 'Strawberries', image: 'https://images.unsplash.com/photo-1616690602454-882bbb363daa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJpZXMlMjBmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc2MDc5MjYyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '24', name: 'Oranges', image: 'https://images.unsplash.com/photo-1757283961709-1087406a5df1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2VzJTIwZnJlc2glMjBjaXRydXN8ZW58MXx8fHwxNzYwODk2MDIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '25', name: 'Grapes', image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwZXMlMjBmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc2MDg5NjAyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Fresh Vegetables
  { id: '10', name: 'Tomatoes', image: 'https://images.unsplash.com/photo-1586640167802-8af12bf651fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG9lcyUyMGZyZXNoJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NTcxNjI0NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '19', name: 'Carrots', image: 'https://images.unsplash.com/photo-1603462903957-566630607cc7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb3RzJTIwZnJlc2glMjB2ZWdldGFibGV8ZW58MXx8fHwxNzYwODk2MDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '20', name: 'Lettuce', image: 'https://images.unsplash.com/photo-1621954166232-658da2c17ba8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0dWNlJTIwc2FsYWQlMjBncmVlbnN8ZW58MXx8fHwxNzYwODk2MDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '21', name: 'Potatoes', image: 'https://images.unsplash.com/photo-1594885270227-c61f9bc1383d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG9lcyUyMGZyZXNoJTIwdmVnZXRhYmxlfGVufDF8fHx8MTc2MDg5NjAxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '22', name: 'Onions', image: 'https://images.unsplash.com/photo-1628793561336-5e90cb873032?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbnMlMjBmcmVzaCUyMHZlZ2V0YWJsZXxlbnwxfHx8fDE3NjA4OTYwMTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Dairy & Eggs
  { id: '3', name: 'Milk', image: 'https://images.unsplash.com/photo-1685531309627-f0c9e8656ff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrJTIwY2FydG9uJTIwZGFpcnl8ZW58MXx8fHwxNzU3MTYyNDUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '5', name: 'Eggs', image: 'https://images.unsplash.com/photo-1635165250545-277ed55a6349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ2dzJTIwY2FydG9uJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NTcxNjI0NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '7', name: 'Cheese', image: 'https://images.unsplash.com/photo-1590912710024-6d51a6771abd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2UlMjBibG9jayUyMGRhaXJ5fGVufDF8fHx8MTc1NzE2MjQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '9', name: 'Yogurt', image: 'https://images.unsplash.com/photo-1709620044505-d7dc01c665d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2d1cnQlMjBjb250YWluZXIlMjBoZWFsdGh5fGVufDF8fHx8MTc1NzE2MjQ1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '18', name: 'Butter', image: 'https://images.unsplash.com/photo-1736752346246-61f4daedfde0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXR0ZXIlMjBkYWlyeSUyMHN0aWNrfGVufDF8fHx8MTc2MDg5NjAxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '42', name: 'Ice Cream', image: 'https://images.unsplash.com/photo-1647972488547-247963b61bc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2UlMjBjcmVhbSUyMHR1YnxlbnwxfHx8fDE3NjA4ODk5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Meat & Seafood
  { id: '8', name: 'Chicken', image: 'https://images.unsplash.com/photo-1588767768106-1b20e51d9d68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwbWVhdCUyMHByb3RlaW58ZW58MXx8fHwxNzU3MTYyNDU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '53', name: 'Salmon', image: 'https://images.unsplash.com/photo-1706115290105-37c4646a2319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwc2FsbW9uJTIwc2VhZm9vZHxlbnwxfHx8fDE3NjA4OTYwNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '54', name: 'Ground Beef', image: 'https://images.unsplash.com/photo-1700777279865-fbb065328a25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91bmQlMjBiZWVmJTIwbWVhdHxlbnwxfHx8fDE3NjA4OTYwNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Bakery
  { id: '2', name: 'Bread', image: 'https://images.unsplash.com/photo-1666114170628-b34b0dcc21aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVhZCUyMGxvYWYlMjBiYWtlcnl8ZW58MXx8fHwxNzU3MTYyNDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Pantry & Dry Goods
  { id: '11', name: 'Pasta', image: 'https://images.unsplash.com/photo-1613634333954-085b019d87b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGJveCUyMGl0YWxpYW58ZW58MXx8fHwxNzU3MTYyNDYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '12', name: 'Cereal', image: 'https://images.unsplash.com/photo-1616662707741-9f32deea4863?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJlYWwlMjBib3glMjBicmVha2Zhc3R8ZW58MXx8fHwxNzU3MTYyNDYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '13', name: 'Rice', image: 'https://images.unsplash.com/photo-1691482995300-b57fef9fa0ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFja2FnZSUyMGdyYWlufGVufDF8fHx8MTc2MDg5NjAxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '14', name: 'Coffee', image: 'https://images.unsplash.com/photo-1649056747314-74345cf99a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBwYWNrYWdlJTIwYmVhbnN8ZW58MXx8fHwxNzYwODk2MDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '15', name: 'Sugar', image: 'https://images.unsplash.com/photo-1756382713824-3adf2fca82e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhciUyMHBhY2thZ2UlMjB3aGl0ZXxlbnwxfHx8fDE3NjA4OTYwMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '16', name: 'Flour', image: 'https://images.unsplash.com/photo-1641394535269-dbea1fa94ff1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG91ciUyMGJhZyUyMGJha2luZ3xlbnwxfHx8fDE3NjA4OTYwMTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '41', name: 'Tea Bags', image: 'https://images.unsplash.com/photo-1758272267310-d068386fe19a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWElMjBiYWdzJTIwYm94fGVufDF8fHx8MTc2MDg5NjAzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Beverages
  { id: '6', name: 'Orange Juice', image: 'https://images.unsplash.com/photo-1640213505284-21352ee0d76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBqdWljZSUyMGJvdHRsZXxlbnwxfHx8fDE3NTcwNzczNTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '46', name: 'Soda', image: 'https://images.unsplash.com/photo-1637511077275-631f0dc80cf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY2FuJTIwZHJpbmt8ZW58MXx8fHwxNzYwODk2MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '47', name: 'Water Bottles', image: 'https://images.unsplash.com/photo-1601507793214-77d2a926582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGJvdHRsZSUyMHBsYXN0aWN8ZW58MXx8fHwxNzYwODk2MDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Snacks
  { id: '28', name: 'Cookies', image: 'https://images.unsplash.com/photo-1609299962226-8c3b9f6e8d48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raWVzJTIwcGFja2FnZSUyMHN3ZWV0fGVufDF8fHx8MTc2MDg5NjAyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '29', name: 'Crackers', image: 'https://images.unsplash.com/photo-1560340841-eefc7aa04432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFja2VycyUyMGJveCUyMHNuYWNrfGVufDF8fHx8MTc2MDg5NjAyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '30', name: 'Chips', image: 'https://images.unsplash.com/photo-1641693148759-843d17ceac24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlwcyUyMGJhZyUyMHNuYWNrfGVufDF8fHx8MTc2MDg5NjAyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Condiments & Spreads
  { id: '31', name: 'Peanut Butter', image: 'https://images.unsplash.com/photo-1691480208637-6ed63aac6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFudXQlMjBidXR0ZXIlMjBqYXJ8ZW58MXx8fHwxNzYwODU3NzMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '32', name: 'Jam', image: 'https://images.unsplash.com/photo-1741521899993-1cbb155691a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYW0lMjBqYXIlMjBzdHJhd2JlcnJ5fGVufDF8fHx8MTc2MDg5NjAyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '33', name: 'Honey', image: 'https://images.unsplash.com/photo-1655169947079-5b2a38815147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob25leSUyMGphciUyMG5hdHVyYWx8ZW58MXx8fHwxNzYwODc2MTI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '36', name: 'Ketchup', image: 'https://images.unsplash.com/photo-1569790554690-1c0877b2fc6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrZXRjaHVwJTIwYm90dGxlJTIwY29uZGltZW50fGVufDF8fHx8MTc2MDg5NjAyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '37', name: 'Mustard', image: 'https://images.unsplash.com/photo-1735027441013-032751c073e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXN0YXJkJTIwYm90dGxlJTIwY29uZGltZW50fGVufDF8fHx8MTc2MDg5NjAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '38', name: 'Mayonnaise', image: 'https://images.unsplash.com/photo-1616803207201-0299ea417b4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXlvbm5haXNlJTIwamFyJTIwY29uZGltZW50fGVufDF8fHx8MTc2MDg5NjAyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '39', name: 'Olive Oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbCUyMGJvdHRsZXxlbnwxfHx8fDE3NjA4MjM2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '40', name: 'Vinegar', image: 'https://images.unsplash.com/photo-1583907659441-addbe699e921?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW5lZ2FyJTIwYm90dGxlJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjA4OTYwMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '44', name: 'Salad Dressing', image: 'https://images.unsplash.com/photo-1744233277849-029cd7f525d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGRyZXNzaW5nJTIwYm90dGxlfGVufDF8fHx8MTc2MDg5NjAzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Canned Foods
  { id: '34', name: 'Canned Soup', image: 'https://images.unsplash.com/photo-1695623675612-9745e0c2849b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBzb3VwJTIwdGlufGVufDF8fHx8MTc2MDg5NjAyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '35', name: 'Canned Beans', image: 'https://images.unsplash.com/photo-1653174577821-9ab410d92d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBiZWFucyUyMHRpbnxlbnwxfHx8fDE3NjA4OTYwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '45', name: 'Pickles', image: 'https://images.unsplash.com/photo-1727285101091-8f9714f87908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWNrbGVzJTIwamFyJTIwY3VjdW1iZXJ8ZW58MXx8fHwxNzYwODk2MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Frozen Foods
  { id: '43', name: 'Frozen Vegetables', image: 'https://images.unsplash.com/photo-1658708009342-af5795fa4284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcm96ZW4lMjB2ZWdldGFibGVzJTIwYmFnfGVufDF8fHx8MTc2MDg5NjAzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Personal Care
  { id: '26', name: 'Shampoo', image: 'https://images.unsplash.com/photo-1673557818087-4056db868568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFtcG9vJTIwYm90dGxlJTIwYmF0aHJvb218ZW58MXx8fHwxNzYwODk2MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '27', name: 'Toothpaste', image: 'https://images.unsplash.com/photo-1759910548177-638d4e6ee0d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b290aHBhc3RlJTIwdHViZSUyMGRlbnRhbHxlbnwxfHx8fDE3NjA4OTYwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '48', name: 'Bar Soap', image: 'https://images.unsplash.com/photo-1661450159298-d58a3b98f3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2FwJTIwYmFyJTIwY2xlYW58ZW58MXx8fHwxNzYwODk2MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '52', name: 'Cotton Swabs', image: 'https://images.unsplash.com/photo-1655313719494-1d700d4aedd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBiYWxscyUyMHN3YWJzfGVufDF8fHx8MTc2MDg5NjA0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Health & Wellness
  { id: '17', name: 'Vitamins', image: 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWlucyUyMGJvdHRsZSUyMHN1cHBsZW1lbnRzfGVufDF8fHx8MTc2MDg5NjAyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '49', name: 'Band-Aids', image: 'https://images.unsplash.com/photo-1624884270783-2688cce31870?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5kYWdlcyUyMGZpcnN0JTIwYWlkfGVufDF8fHx8MTc2MDg5NjAyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '50', name: 'Hand Sanitizer', image: 'https://images.unsplash.com/photo-1695624825876-7110a459a21a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kJTIwc2FuaXRpemVyJTIwYm90dGxlfGVufDF8fHx8MTc2MDgyNjE3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Household Items
  { id: '55', name: 'Tissues', image: 'https://images.unsplash.com/photo-1611907992783-08f52a765966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXNzdWVzJTIwYm94JTIwa2xlZW5leHxlbnwxfHx8fDE3NjA4OTYwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '56', name: 'Toilet Paper', image: 'https://images.unsplash.com/photo-1588318072736-5d5a82354cb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2lsZXQlMjBwYXBlciUyMHJvbGx8ZW58MXx8fHwxNzYwODE0ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '57', name: 'Paper Towels', image: 'https://images.unsplash.com/photo-1653267408946-c4f8421392cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXBlciUyMHRvd2VscyUyMGtpdGNoZW58ZW58MXx8fHwxNzYwODk2MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '58', name: 'Dish Soap', image: 'https://images.unsplash.com/photo-1698664434322-94a43b98b9ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNoJTIwc29hcCUyMGJvdHRsZXxlbnwxfHx8fDE3NjA4MTUyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '59', name: 'Laundry Detergent', image: 'https://images.unsplash.com/photo-1646013976311-d7de74c2f679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwZGV0ZXJnZW50JTIwYm90dGxlfGVufDF8fHx8MTc2MDgxNTIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '60', name: 'Sponges', image: 'https://images.unsplash.com/photo-1722356541555-eeabc38f80a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9uZ2UlMjBjbGVhbmluZyUyMGtpdGNoZW58ZW58MXx8fHwxNzYwODk2MDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '61', name: 'Aluminum Foil', image: 'https://images.unsplash.com/photo-1678108439262-a11d16f99c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHVtaW51bSUyMGZvaWwlMjBraXRjaGVufGVufDF8fHx8MTc2MDg5NjAyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '62', name: 'Plastic Wrap', image: 'https://images.unsplash.com/photo-1604393587377-bbe4a437ec80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwd3JhcCUyMGtpdGNoZW58ZW58MXx8fHwxNzYwODk2MDI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '63', name: 'Trash Bags', image: 'https://images.unsplash.com/photo-1615662724527-96679561c0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFzaCUyMGJhZ3MlMjByb2xsfGVufDF8fHx8MTc2MDg5NjAyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '64', name: 'Bleach', image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGVhY2glMjBib3R0bGUlMjBjbGVhbmVyfGVufDF8fHx8MTc2MDg5NjAzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '65', name: 'Light Bulbs', image: 'https://images.unsplash.com/photo-1565516424918-cb83feb00c48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWdodGJ1bGIlMjBwYWNrYWdlJTIwbGVkfGVufDF8fHx8MTc2MDg5NjAzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '66', name: 'Batteries', image: 'https://images.unsplash.com/photo-1591964006776-90b32e88f5ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJpZXMlMjBwYWNrYWdlJTIwYWF8ZW58MXx8fHwxNzYwODk2MDM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
];

const initialState: GameState = {
  currentPage: 'home',
  settings: {
    listLength: 5,
    timerEnabled: true,
    timerMinutes: 3,
    hintsEnabled: true,
    maxHints: 2,
  },
  shoppingList: [],
  availableItems: GROCERY_ITEMS,
  selectedItems: [],
  gameStats: {
    accuracy: 0,
    timeTaken: 0,
    hintsUsed: 0,
    itemsCorrect: 0,
    itemsTotal: 0,
  },
  gameHistory: [],
  hintsUsed: 0,
  timeStarted: null,
  lastHintTime: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    
    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.settings };
      return { ...state, settings: newSettings };
    
    case 'START_GAME':
      const shuffledItems = [...GROCERY_ITEMS].sort(() => Math.random() - 0.5);
      const shoppingList = shuffledItems.slice(0, state.settings.listLength);
      
      // Calculate total items to display based on list length
      // Lists of 1-5 items: 20 total items
      // Lists of 6-8 items: 22 total items  
      // Lists of 9-10 items: 24 total items
      let totalItemsToDisplay: number;
      if (state.settings.listLength <= 5) {
        totalItemsToDisplay = 20;
      } else if (state.settings.listLength <= 8) {
        totalItemsToDisplay = 22;
      } else {
        totalItemsToDisplay = 24;
      }
      
      // Ensure all shopping list items are included in available items
      const otherItems = GROCERY_ITEMS.filter(item => 
        !shoppingList.find(listItem => listItem.id === item.id)
      );
      const shuffledOtherItems = otherItems.sort(() => Math.random() - 0.5);
      
      // Calculate distraction items (total - shopping list items)
      const distractionCount = totalItemsToDisplay - shoppingList.length;
      const availableItems = [
        ...shoppingList,
        ...shuffledOtherItems.slice(0, distractionCount)
      ].sort(() => Math.random() - 0.5);
      
      return {
        ...state,
        shoppingList,
        availableItems,
        selectedItems: [],
        hintsUsed: 0,
        timeStarted: Date.now(),
        currentPage: 'list',
      };
    
    case 'SELECT_ITEM':
      if (state.selectedItems.find(item => item.id === action.item.id)) {
        return state;
      }
      return {
        ...state,
        selectedItems: [...state.selectedItems, action.item],
      };
    
    case 'DESELECT_ITEM':
      return {
        ...state,
        selectedItems: state.selectedItems.filter(item => item.id !== action.itemId),
      };
    
    case 'USE_HINT':
      if (state.hintsUsed >= state.settings.maxHints || Date.now() - state.lastHintTime < 5000) {
        return state;
      }
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        lastHintTime: Date.now(),
      };
    
    case 'FINISH_GAME':
      const timeTaken = state.timeStarted ? (Date.now() - state.timeStarted) / 1000 : 0;
      const itemsCorrect = state.selectedItems.filter(selected => 
        state.shoppingList.find(required => required.id === selected.id)
      ).length;
      const accuracy = (itemsCorrect / state.shoppingList.length) * 100;
      
      const gameStats: GameStats = {
        accuracy: Math.round(accuracy),
        timeTaken: Math.round(timeTaken),
        hintsUsed: state.hintsUsed,
        itemsCorrect,
        itemsTotal: state.shoppingList.length,
      };
      
      return {
        ...state,
        gameStats,
        currentPage: 'results',
      };
    
    case 'SAVE_GAME_RESULT':
      const newHistory = [...state.gameHistory, state.gameStats];
      return {
        ...state,
        gameHistory: newHistory,
        currentPage: 'stats',
      };
    
    case 'LOAD_SETTINGS':
      return { ...state, settings: action.settings };
    
    case 'LOAD_HISTORY':
      return { ...state, gameHistory: action.history };
    
    case 'RESET_GAME':
      return {
        ...initialState,
        settings: state.settings,
        gameHistory: state.gameHistory,
      };
    
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isLoading: boolean;
  loadUserData: () => Promise<void>;
  isDemoMode: boolean;
} | null>(null);

interface GameProviderProps {
  children: ReactNode;
  isDemoMode?: boolean;
}

export function GameProvider({ children, isDemoMode = false }: GameProviderProps) {
  const [state, baseDispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = useState(!isDemoMode); // Don't show loading in demo mode

  // Wrap dispatch to add Supabase save side effects (only when not in demo mode)
  const dispatch: React.Dispatch<GameAction> = (action) => {
    baseDispatch(action);

    if (isDemoMode) {
      return; // Skip all Supabase calls in demo mode
    }

    // Handle Supabase sync after state updates
    if (action.type === 'UPDATE_SETTINGS') {
      const newSettings = { ...state.settings, ...action.settings };
      updateUserSettings(newSettings).catch(err => {
        console.error('Failed to update settings:', err);
      });
    } else if (action.type === 'SAVE_GAME_RESULT') {
      saveGameResult(state.gameStats).catch(err => {
        console.error('Failed to save game result:', err);
      });
    }
  };

  // Function to load user data from Supabase
  const loadUserData = async () => {
    if (isDemoMode) {
      setIsLoading(false);
      return; // Skip loading in demo mode
    }

    setIsLoading(true);
    try {
      // Load settings
      const { settings } = await getUserSettings();
      if (settings) {
        baseDispatch({ type: 'LOAD_SETTINGS', settings });
      }

      // Load game history
      const { games } = await getGameHistory();
      if (games) {
        baseDispatch({ type: 'LOAD_HISTORY', history: games });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, isLoading, loadUserData, isDemoMode }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { GROCERY_ITEMS };