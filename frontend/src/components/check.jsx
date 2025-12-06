import React from "react";
import { Check, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComparisonTable = () => {
  const navigate = useNavigate();
  const features = [
    { name: "Expense Tracking", fairfare: true, splitwise: true },
    { name: "Unlimited Events", fairfare: true, splitwise: false },
    { name: "Interactive Event Cards", fairfare: true, splitwise: false },
    { name: "Personal AI Assistant", fairfare: true, splitwise: false },
    { name: "User-Centric Features", fairfare: true, splitwise: false },
    { name: "Enhanced Aesthetics", fairfare: true, splitwise: false },
    { name: "Trip Management", fairfare: true, splitwise: true },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-0 py-10 relative">
      {/* Background Glow for specific section focus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Smart Choice
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See why power users are switching to FairFare.
          </p>
        </div>

        {/* The Matrix Table */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Table Headers */}
          <div className="grid grid-cols-3 p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-end">
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">
                Feature
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-white mb-1">
                FairFare
              </span>
              <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Recommended
              </span>
            </div>
            <div className="text-center flex flex-col justify-end">
              <span className="text-slate-500 font-semibold text-lg">
                Others
              </span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="grid grid-cols-3 p-5 md:p-6 hover:bg-white/[0.02] transition-colors duration-200 group items-center"
              >
                {/* Column 1: Feature Name */}
                <div className="flex items-center">
                  <span className="text-slate-200 font-medium text-sm md:text-base group-hover:text-white transition-colors">
                    {feature.name}
                  </span>
                </div>

                {/* Column 2: FairFare (Highlighted) */}
                <div className="flex justify-center relative">
                  {/* Vertical Highlight Effect for this column */}
                  <div className="absolute inset-y-[-24px] w-full bg-gradient-to-b from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  {feature.fairfare ? (
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-500">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Column 3: Competitors (Muted) */}
                <div className="flex justify-center">
                  {feature.splitwise ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-slate-600 opacity-50">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/signup")}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:bg-indigo-50 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
          >
            <Sparkles className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
            <span>Experience the Difference</span>
          </button>
          <p className="text-slate-500 mt-6 text-sm">
            No credit card required. Free forever.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
