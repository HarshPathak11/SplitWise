import { 
  Home, 
  Layers, 
  Infinity, 
  Activity, 
  Bot, 
  ShieldCheck, 
  Zap, 
  Cpu 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import "./features.css"; // Import the external CSS file

const Features = () => {
  const navigate = useNavigate();

return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate("/")}
          className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
          aria-label="Return to Base"
        >
          <Home className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
            <Cpu size={14} /> System Capabilities
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Modules</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Advanced financial tracking protocols designed for maximum efficiency and seamless user integration.
          </p>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Interactive Cards */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
              <Layers className="text-indigo-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">Interactive Event Cards</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Detailed holographic cards with enhanced interactivity. Track, organize, and manage expenses with a user-friendly design optimized for speed.
            </p>
          </div>

          {/* Feature 2: Unlimited Events */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-fuchsia-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
              <Infinity className="text-fuchsia-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-200 transition-colors">Unlimited Events</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Zero restrictions on protocol creation. Unlike competitors, our free tier empowers you to generate unlimited event logs with total freedom.
            </p>
          </div>

          {/* Feature 3: Expense Tracking */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
              <Activity className="text-cyan-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">Expense Tracking</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Comprehensive ledger system. Add context, specify beneficiaries, and clarify debts for shared group finances or personal audits.
            </p>
          </div>

          {/* Feature 4: AI Assistant */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Bot className="text-emerald-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-200 transition-colors">Personal AI Assistant</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Automated financial intelligence. Smart insights, instant calculations, and seamless organization to make group management effortless.
            </p>
          </div>

          {/* Feature 5: User-Centric */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-orange-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
              <ShieldCheck className="text-orange-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-orange-200 transition-colors">Privacy & Security</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              We prioritize data sovereignty. No credit checks, encrypted data transmission, and a secure environment for your financial logs.
            </p>
          </div>

          {/* Feature 6: Aesthetics */}
          <div className="group relative bg-zinc-900/40 border border-white/5 hover:border-rose-500/30 rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:bg-rose-500/20 transition-colors">
              <Zap className="text-rose-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-rose-200 transition-colors">Enhanced Aesthetics</h2>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Next-gen UI architecture. Vibrant cyber-aesthetics, intuitive navigation, and fluid animations for an exceptional user experience.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Features;
