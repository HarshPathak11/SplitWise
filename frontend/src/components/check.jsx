import React from 'react';
import { Check, X, Star, Sparkles } from 'lucide-react';

const ComparisonTable = () => {
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

        {/* Comparison Table */}
        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden backdrop-blur-xl">
          {/* Table Header */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 border-b border-gray-700/50 bg-gray-900/30">
            <div className=" hidden md:flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-300">Features</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  FairFare
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                {/* <Star className="w-4 h-4 text-blue-400 fill-current" /> */}
                <span className="text-xs text-blue-300">Recommended</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-gray-300 mb-2">SplitWise</span>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full">
              <span className="text-xs text-gray-500">Competitor</span>
              </div>
            </div>
          </div>

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

          {/* Pricing Footer */}
          <div className="grid grid-cols-3 gap-8 p-8 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/40 to-gray-800/40">
            <div className="flex items-center justify-center">
              <span className="text-xl font-bold text-white">Annual Cost</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  $0
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                {/* <Star className="w-4 h-4 text-green-400 fill-current" /> */}
                <span className="text-green-300 font-semibold text-sm">Forever Free</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-300">$40</span>
              </div>
              <span className="text-gray-500 font-medium">per year</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25">
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