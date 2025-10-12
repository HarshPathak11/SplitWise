import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  MessageSquare, 
  Layout, 
  MessageCircle, 
  Users, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  TrendingUp, 
  Activity, 
  Target 
} from 'lucide-react';
import { Link } from "react-router-dom";

export default function MarketingCampaigns() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-bold">Marketing Hub</h1>
        </div>

        <nav className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Main Menu
          </div>
          <a
            href="#"
            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"
          >
            <MessageCircle size={20} />
            <span className="font-medium">Campaigns</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Users size={20} />
            <span>Audience</span>
          </a>
          <a
            className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Link to='/coming-soon'>
            <BarChart3 size={20} />
            <span>Analytics</span>
            </Link>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Marketing Campaigns
            </h1>
            <p className="text-gray-600">
              Manage and monitor your marketing campaigns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="outline-none bg-transparent"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              New Campaign
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold mt-1">45.2K</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold mt-1">24.8%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion</p>
                <p className="text-2xl font-bold mt-1">8.3%</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Notification Campaign */}
          <div
            onClick={() => navigate("/marketing/notification")}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Bell size={24} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Notification Campaign
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Send custom push notifications and in-app messages to targeted
              user segments
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last used: 2 hours ago</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                1.2K users
              </span>
            </div>
          </div>

          {/* Email Campaign */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Mail size={24} className="text-purple-600" />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-2 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                Draft
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Campaign</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create and send bulk email campaigns with advanced segmentation
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last used: 3 days ago</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                8.5K users
              </span>
            </div>
          </div>

          {/* SMS Campaign */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <MessageSquare size={24} className="text-green-600" />
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Scheduled
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">SMS Campaign</h3>
            <p className="text-gray-600 text-sm mb-4">
              Send targeted SMS messages with high delivery rates
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Scheduled: Tomorrow</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                2.3K users
              </span>
            </div>
          </div>

          {/* In-App Messages */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Layout size={24} className="text-orange-600" />
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">In-App Messages</h3>
            <p className="text-gray-600 text-sm mb-4">
              Display targeted messages within your application interface
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last used: 1 hour ago</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                5.7K users
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
