import React from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProfileEdit() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <Link to="/dash" className="flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80"
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-700"
              />
              <button className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full hover:bg-emerald-600 transition-colors">
                <Camera className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                defaultValue="Alex Johnson"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                defaultValue="alex@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Currency Preference
              </label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;