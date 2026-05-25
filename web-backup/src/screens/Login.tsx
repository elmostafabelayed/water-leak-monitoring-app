import { useState } from 'react';
import { Droplet, Lock, Mail, ArrowRight, Shield, Activity } from 'lucide-react';

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation d'une requête API (ex: JWT authentication)
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="flex justify-center bg-slate-950 min-h-screen font-sans text-slate-300">
      <div className="w-full max-w-[420px] bg-[#0f172a] shadow-2xl relative flex flex-col min-h-screen overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-20 w-48 h-48 bg-cyan-600/10 blur-[80px] rounded-full"></div>

        {/* Header Logo */}
        <div className="flex flex-col items-center mt-20 mb-12 z-10">
          <div className="w-20 h-20 rounded-full bg-cyan-950/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] border border-cyan-900">
            <Droplet className="w-10 h-10 text-cyan-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Water Leak <span className="text-cyan-400">Guardian</span>
          </h1>
          <p className="text-slate-400 text-sm mt-3 text-center px-4">
            Secure access to your municipal hydro-monitoring systems.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-[24px] p-6 shadow-xl border border-slate-800 z-10">
          <h2 className="text-white text-xl font-bold mb-6">System Login</h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Operator Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  defaultValue="operator@citygrid.io"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300">Forgot Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  defaultValue="••••••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex justify-center items-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"/>
              ) : (
                <>
                  Initiate Connection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            New operator? <a href="#" className="text-cyan-400 font-semibold hover:text-cyan-300">Request Access</a>
          </div>
        </form>

        {/* Footer info (Encryption) */}
        <div className="mt-auto pt-8 flex gap-4 z-10 pb-8">
          <div className="bg-[#1e293b]/50 border border-slate-800 rounded-xl p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Encryption</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full mb-1">
              <div className="h-full bg-cyan-500 rounded-full w-[90%]"></div>
            </div>
            <p className="text-[10px] text-slate-500">AES-256 Bit Standard</p>
          </div>

          <div className="bg-[#1e293b]/50 border border-slate-800 rounded-xl p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Network</span>
            </div>
            <p className="text-white font-bold tracking-tight">14.2 <span className="text-[10px] text-slate-500 font-normal">ms ping</span></p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cloud Node: US-EAST</p>
          </div>
        </div>

      </div>
    </div>
  );
}