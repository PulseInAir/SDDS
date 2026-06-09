'use client';

import { usePrivacy } from '@/context/PrivacyContext';
import { Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Header() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <header className="h-16 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-md px-8 flex items-center justify-between z-20 relative select-none">
      {/* Quick Status */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SDDS Operating Environment Active</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Privacy Toggle Button */}
        <button
          type="button"
          onClick={togglePrivacyMode}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isPrivacyMode
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 shadow-lg shadow-blue-500/5'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isPrivacyMode ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Privacy Mode: ON</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Privacy Mode: OFF</span>
            </>
          )}
        </button>

        {/* Security Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-medium text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>SSL Secure Connection</span>
        </div>
      </div>
    </header>
  );
}
