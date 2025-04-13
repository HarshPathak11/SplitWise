import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, Users, Map, MessageSquareMore, Settings, Clock, DollarSign } from 'lucide-react';

// Enhanced mock data
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  joinDate: "March 2024",
  totalFriends: 24,
  totalBalance: 325.50,
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80"
};

const mockFriends = [
  {
    id: 1,
    name: "Sarah Wilson",
    amount: 120,
    owes: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80",
    recentTrips: [
      { id: 1, name: "Weekend Getaway", date: "2024-03-15", amount: 45 },
      { id: 2, name: "Dinner at Luigi's", date: "2024-03-10", amount: 35 },
      { id: 3, name: "Movie Night", date: "2024-03-05", amount: 25 },
      { id: 4, name: "Beach Day", date: "2024-02-28", amount: 15 }
    ]
  },
  {
    id: 2,
    name: "Mike Chen",
    amount: 45,
    owes: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80",
    recentTrips: [
      { id: 1, name: "Camping Trip", date: "2024-03-12", amount: 85 },
      { id: 2, name: "BBQ Party", date: "2024-03-08", amount: 30 },
      { id: 3, name: "Concert Night", date: "2024-03-01", amount: 60 }
    ]
  },
  {
    id: 3,
    name: "Emma Davis",
    amount: 75,
    owes: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop&q=80",
    recentTrips: [
      { id: 1, name: "Shopping Spree", date: "2024-03-14", amount: 120 },
      { id: 2, name: "Lunch Meeting", date: "2024-03-09", amount: 25 },
      { id: 3, name: "Coffee Catch-up", date: "2024-03-04", amount: 15 }
    ]
  }
];

const mockTrips = [
  {
    id: 1,
    name: "Weekend Getaway",
    date: "2024-03-15",
    totalAmount: 450,
    participants: 4,
    status: "settled",
    location: "Lake Tahoe",
    transactions: [
      { payer: "Alex Johnson", amount: 200, for: ["Sarah Wilson", "Mike Chen", "Emma Davis"], description: "Hotel Booking" },
      { payer: "Sarah Wilson", amount: 150, for: ["Alex Johnson", "Mike Chen"], description: "Groceries" },
      { payer: "Mike Chen", amount: 100, for: ["Alex Johnson", "Sarah Wilson", "Emma Davis"], description: "Gas" }
    ]
  },
  {
    id: 2,
    name: "Birthday Dinner",
    date: "2024-03-10",
    totalAmount: 280,
    participants: 3,
    status: "pending",
    location: "Italian Restaurant",
    transactions: [
      { payer: "Alex Johnson", amount: 180, for: ["Sarah Wilson", "Emma Davis"], description: "Main Course" },
      { payer: "Emma Davis", amount: 100, for: ["Alex Johnson", "Sarah Wilson"], description: "Drinks & Dessert" }
    ]
  },
  {
    id: 3,
    name: "Concert Night",
    date: "2024-03-05",
    totalAmount: 600,
    participants: 4,
    status: "settled",
    location: "Arena Stadium",
    transactions: [
      { payer: "Mike Chen", amount: 400, for: ["Alex Johnson", "Sarah Wilson", "Emma Davis"], description: "Tickets" },
      { payer: "Alex Johnson", amount: 200, for: ["Mike Chen", "Sarah Wilson", "Emma Davis"], description: "After Party" }
    ]
  }
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('friends');
  const [expandedFriend, setExpandedFriend] = useState(null);
  const [expandedTrip, setExpandedTrip] = useState(null);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-gray-800 p-4">
        <div className="flex flex-col items-center lg:items-start space-y-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-emerald-500" />
            <span className="hidden lg:block text-xl font-bold">CashMap</span>
          </div>
          
          <nav className="flex flex-col space-y-4 w-full">
            <Link to="/" className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg">
              <User className="h-5 w-5" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
            <Link to="/ai-assistant" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <MessageSquareMore className="h-5 w-5" />
              <span className="hidden lg:block">AI Assistant</span>
            </Link>
            <Link to="/profile/edit" className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-lg">
              <Settings className="h-5 w-5" />
              <span className="hidden lg:block">Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Profile Section */}
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <img
                src={mockUser.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-emerald-500"
              />
              <div>
                <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                <p className="text-gray-400">{mockUser.email}</p>
                <p className="text-sm text-gray-500">Member since {mockUser.joinDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-500">${mockUser.totalBalance}</p>
              <p className="text-sm text-gray-400">Total Balance</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 bg-gray-800/50">
          <div className="max-w-7xl mx-auto flex space-x-8 px-6">
            <button
              className={`py-4 px-2 relative ${
                activeTab === 'friends'
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('friends')}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Friends</span>
              </div>
            </button>
            <button
              className={`py-4 px-2 relative ${
                activeTab === 'trips'
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('trips')}
            >
              <div className="flex items-center space-x-2">
                <Map className="h-5 w-5" />
                <span>Trips</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'friends' ? (
            <div className="space-y-6">
              {mockFriends.map(friend => (
                <div
                  key={friend.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-500 transition-colors overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedFriend(expandedFriend === friend.id ? null : friend.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{friend.name}</h3>
                          <p className="text-sm text-gray-400">
                            {friend.recentTrips.length} shared trips
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          friend.owes ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                          {friend.owes ? '-' : '+'} ${friend.amount}
                        </span>
                        <p className="text-sm text-gray-400">
                          {friend.owes ? 'you will receive' : 'you owe'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {expandedFriend === friend.id && (
                    <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Recent Trips</h4>
                      <div className="space-y-3">
                        {friend.recentTrips.map(trip => (
                          <div key={trip.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{trip.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-400">{trip.date}</span>
                              <span className="text-emerald-500">${trip.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {mockTrips.map(trip => (
                <div
                  key={trip.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-500 transition-colors overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center space-x-2">
                          <span>{trip.name}</span>
                          <span className="text-sm text-gray-400">• {trip.location}</span>
                        </h3>
                        <p className="text-sm text-gray-400">
                          {trip.participants} participants • {trip.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-emerald-500">
                          ${trip.totalAmount}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          trip.status === 'settled'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedTrip === trip.id && (
                    <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3">Transaction History</h4>
                      <div className="space-y-4">
                        {trip.transactions.map((transaction, idx) => (
                          <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-emerald-500" />
                                <span className="font-medium">{transaction.payer}</span>
                                <span className="text-gray-400">paid</span>
                                <span className="text-emerald-500 font-medium">${transaction.amount}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">{transaction.description}</p>
                            <div className="mt-2 text-sm">
                              <span className="text-gray-400">Split with: </span>
                              {transaction.for.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;