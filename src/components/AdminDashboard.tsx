import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Users, TrendingUp, Calendar, Trophy, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAccessToken } from '../utils/supabase/client';

interface UserData {
  id: string;
  email: string;
  name: string;
  age: number | null;
  created_at: string;
  totalGames: number;
  avgAccuracy: number;
  lastPlayed: string | null;
  recentGames: Array<{
    accuracy: number;
    timeTaken: number;
    hintsUsed: number;
    itemsCorrect: number;
    itemsTotal: number;
    timestamp: string;
  }>;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-34ba2954/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (accuracy >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (accuracy >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => setSelectedUser(null)}
            variant="outline"
            className="mb-6 h-14 px-6 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Users
          </Button>

          <Card className="p-8 bg-white border-4 border-blue-200 shadow-2xl rounded-3xl mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-blue-800 mb-2">{selectedUser.name}</h2>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-gray-600">Age: {selectedUser.age || 'Not specified'}</p>
                <p className="text-gray-500">
                  Joined {formatDate(selectedUser.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-center border-2 border-blue-100">
                  <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">Total Games</p>
                  <p className="text-blue-800">{selectedUser.totalGames}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl text-center border-2 border-green-100">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">Avg Accuracy</p>
                  <p className="text-green-800">{selectedUser.avgAccuracy}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl text-center border-2 border-purple-100">
                  <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-gray-600">Last Played</p>
                  <p className="text-purple-800">{formatDate(selectedUser.lastPlayed)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-white border-4 border-blue-200 shadow-2xl rounded-3xl">
            <h3 className="text-blue-800 mb-4">Recent Games</h3>
            {selectedUser.recentGames.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No games played yet</p>
            ) : (
              <div className="space-y-4">
                {selectedUser.recentGames.map((game, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-600">{formatDate(game.timestamp)}</p>
                      <Badge className={`${getAccuracyColor(game.accuracy)} border-2 px-4 py-1`}>
                        {game.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="text-gray-700">{game.itemsCorrect}/{game.itemsTotal}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="text-gray-700">{game.timeTaken}s</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Hints Used</p>
                        <p className="text-gray-700">{game.hintsUsed}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Score</p>
                        <p className="text-gray-700">{game.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              className="h-14 px-6 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Game
            </Button>
            <h1 className="text-blue-800">Admin Dashboard</h1>
          </div>
          <Button
            onClick={loadUsers}
            variant="outline"
            className="h-14 px-6 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="p-6 bg-red-50 border-2 border-red-200 mb-6">
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border-4 border-blue-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Users</p>
                <p className="text-blue-800">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-4 border-green-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Games Played</p>
                <p className="text-green-800">
                  {users.reduce((sum, user) => sum + user.totalGames, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-4 border-purple-200 shadow-xl rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-2xl">
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Avg Accuracy</p>
                <p className="text-purple-800">
                  {users.length > 0
                    ? Math.round(
                        users.reduce((sum, user) => sum + user.avgAccuracy, 0) / users.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-white border-4 border-blue-200 shadow-2xl rounded-3xl overflow-hidden">
          <h2 className="text-blue-800 mb-6">All Users</h2>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 border-b-2 border-blue-200">
                  <TableHead className="text-blue-800">Name</TableHead>
                  <TableHead className="text-blue-800">Email</TableHead>
                  <TableHead className="text-blue-800">Age</TableHead>
                  <TableHead className="text-blue-800">Total Games</TableHead>
                  <TableHead className="text-blue-800">Avg Accuracy</TableHead>
                  <TableHead className="text-blue-800">Last Played</TableHead>
                  <TableHead className="text-blue-800">Joined</TableHead>
                  <TableHead className="text-blue-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                  >
                    <TableCell className="text-gray-700">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">{user.age || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-200">
                        {user.totalGames}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-2 ${getAccuracyColor(user.avgAccuracy)}`}>
                        {user.avgAccuracy}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(user.lastPlayed)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => setSelectedUser(user)}
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
