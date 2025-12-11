import React from 'react';
import { Icons } from './IconSet';
import { BusinessUnit, UserRole } from '../types';
import { COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeBU: BusinessUnit;
  userRole: UserRole;
  onLoginClick: () => void;
  onHomeClick: () => void;
  onLogoutClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeBU, 
  userRole,
  onLoginClick,
  onHomeClick,
  onLogoutClick
}) => {
  const headerColor = COLORS[activeBU] || 'bg-slate-900';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className={`${headerColor} text-white transition-colors duration-500 sticky top-0 z-40 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={onHomeClick}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="font-serif font-bold text-lg">T</span>
            </div>
            <h1 className="text-lg font-bold tracking-wide uppercase truncate">
              Thakur’s Grandpoint
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {userRole === UserRole.GUEST && (
              <button className="flex flex-col items-center justify-center text-white/80 hover:text-white">
                <Icons.QR className="w-6 h-6" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Scan</span>
              </button>
            )}
            
            {userRole === UserRole.GUEST ? (
              <button 
                onClick={onLoginClick}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Icons.Login className="w-4 h-4" />
                <span>Login</span>
              </button>
            ) : (
               <button 
                onClick={onLogoutClick}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Icons.Logout className="w-4 h-4" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>
        
        {/* BU Indicator Stripe */}
        <div className="bg-black/10 h-1 w-full" />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
