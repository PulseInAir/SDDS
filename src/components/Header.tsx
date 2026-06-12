'use client';

import { Suspense } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { Eye, EyeOff, ShieldCheck, Search, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import AYSelect from '@/components/AYSelect';

function HeaderControls() {
  const searchParams = useSearchParams();
  const currentAY = searchParams.get('ay') || getCurrentAssessmentYear();
  const ayOptions = getAssessmentYears();

  return (
    <>
      <label htmlFor="ay-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Assessment Year:
      </label>
      <div className="relative">
        <AYSelect currentAY={currentAY} ayOptions={ayOptions} />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          ▼
        </div>
      </div>
    </>
  );
}

export default function Header() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <header className="py-4 border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-md px-8 flex flex-col space-y-4 z-20 relative select-none">
      {/* Top Row: Badges */}
      <div className="flex items-center justify-between">
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
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
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
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>SSL Secure Connection</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Search, Controls */}
      <div className="flex items-center justify-between">
        {/* Left spacer for alignment */}
        <div className="flex-1"></div>

        {/* Center: Search & Avatar */}
        <div className="flex-1 flex justify-center items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-64"
            />
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 flex justify-end items-center space-x-3">
          <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
            <HeaderControls />
          </Suspense>
          
          <Link
            href="/clients/new"
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
