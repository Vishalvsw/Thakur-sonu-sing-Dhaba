
import React from 'react';
import { Icons } from './IconSet';
import { Button } from './Components';
import { BusinessUnit } from '../types';

interface SnookerDashboardProps {
  onGoHome: () => void;
}

export const SnookerDashboard: React.FC<SnookerDashboardProps> = ({ onGoHome }) => {
  return (
    <div className="w-full min-h-[70vh] md:h-[80vh] relative rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center p-6 md:p-12 shadow-2xl border border-slate-800 bg-slate-900 group">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1595603038670-6f4b75248c08?q=80&w=2000&auto=format&fit=crop" 
          alt="Snooker Table"
          className="w-full h-full object-cover opacity-40 transition-transform duration-[20s] ease-linear group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-emerald-950/80 to-slate-900/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Floating Icon Badge */}
        <div className="mb-6 md:mb-8 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-bounce-slow">
           <Icons.Snooker className="w-12 h-12 md:w-16 md:h-16 text-emerald-400" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-white mb-4 tracking-tight drop-shadow-lg">
          Pro <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Snooker</span>
        </h1>

        <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full mb-6 opacity-80" />

        <h2 className="text-xl md:text-3xl font-bold text-white/90 mb-2">
           Booking & Food Ordering
        </h2>
        
        <div className="mb-10">
           <span className="inline-block px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(16,185,129,0.4)]">Coming Soon</span>
           <p className="text-lg md:text-xl text-emerald-100/60 font-medium max-w-lg mx-auto">
             We are preparing an exclusive experience for you.
           </p>
        </div>

        {/* Feature Teasers (Tablet/Desktop only) */}
        <div className="hidden md:flex flex-wrap justify-center gap-4 lg:gap-6 mb-12 text-left">
           {[
             { title: "Smart Booking", desc: "Reserve tables instantly.", icon: Icons.Calendar },
             { title: "Table Service", desc: "Order food while you play.", icon: Icons.Food },
             { title: "Tournaments", desc: "Join pro leagues.", icon: Icons.Trending }
           ].map((feat, i) => (
             <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-48 hover:bg-white/10 hover:border-emerald-500/30 transition duration-300 transform hover:-translate-y-1">
                <feat.icon className="w-8 h-8 text-emerald-400 mb-3 bg-emerald-500/10 p-1.5 rounded-lg" />
                <h4 className="text-white font-bold text-sm mb-0.5">{feat.title}</h4>
                <p className="text-white/50 text-xs">{feat.desc}</p>
             </div>
           ))}
        </div>

        <Button 
           onClick={onGoHome} 
           size="xl" 
           bu={BusinessUnit.SNOOKER}
           className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[240px] shadow-xl shadow-emerald-900/40 border-t border-emerald-400/20 rounded-2xl"
           icon={<Icons.ArrowRight className="w-5 h-5 rotate-180" />}
        >
           Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
