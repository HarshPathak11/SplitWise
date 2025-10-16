import React from 'react';
import { Check, X, Star, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ComparisonTable = () => {
  const navigate = useNavigate();
  const features = [
    { name: 'Expense Tracking', fairfare: true, splitwise: true },
    { name: 'Unlimited Events', fairfare: true, splitwise: false },
    { name: 'Interactive Event Cards', fairfare: true, splitwise: false },
    { name: 'Personal AI Assistant', fairfare: true, splitwise: false },
    { name: 'User-Centric Features', fairfare: true, splitwise: false },
    { name: 'Enhanced Aesthetics', fairfare: true, splitwise: false },
    { name: 'Trip Management', fairfare: true, splitwise: true },
  ];

  return (
    <div className="min-h-screen bg-black py-6 px-4 lg:px-8 md:w-[1000px]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">FairFare</span>?
          </h2>
          <p className=" text-md md:text-xl text-gray-400 max-w-2xl mx-auto">
            Compare features and see why FairFare stands out from the competition
          </p>
        </div>

        {/* Table Rows */}
        <div className="space-y-4 backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          {/* <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Expense Tracking</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Unlimited Events</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ❌
            </div>
          </div> */}

          {/* Feature Rows */}
          <div className="divide-y divide-gray-700/30">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="grid grid-cols-3 gap-8 p-5  hover:bg-gray-800/20 transition-all duration-300 group"
              >
                <div className="flex items-center">
                  <span className="text-gray-200 font-medium text-md md:text-lg group-hover:text-white transition-colors duration-300">
                    {feature.name}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  {feature.fairfare ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20">
                      <X className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  {feature.splitwise ? (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
                      <X className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Enhanced Aesthetics</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ❌
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Trip Management</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
          </div> */}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button onClick={() => navigate('/signup')} className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25">
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Get Started with FairFare
          </button>
          <p className="text-gray-400 mt-4">Join thousands of users who've made the switch</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;