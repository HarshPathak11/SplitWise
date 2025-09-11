const ComparisonTable = () => {
  return (
    <div className="relative backdrop-blur-lg bg-transparent py-10 px-4 lg:px-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          {/* <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"></div> */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div></div>
          <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
            FairFare
          </div>
          <div className="text-lg font-semibold text-white/80">SplitWise</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-4 backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
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
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Interactive Event Cards </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ❌
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">Personal AI Assisstant</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ❌
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
            <div className="text-white/80">User-Centric Features</div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ✔️
            </div>
            <div className="text-green-400 text-xl transform hover:scale-110 transition-transform duration-300">
              ❌
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
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
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-3 mt-10 font-bold text-center backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <div className="text-white/90 text-2xl">Cost per year</div>
          <div>
            <div className="text-center text-3xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-cyan-400 to-purple-600">
                $0
              </span>
              <p className="text-sm text-white/60">forever</p>
            </div>
          </div>
          <div>
            <div className="text-center text-2xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 via-zinc-400 to-gray-600">
                $40
              </span>
              <p className="text-sm text-white/60">yearly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
