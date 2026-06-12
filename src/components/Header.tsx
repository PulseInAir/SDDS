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
      <label htmlFor="ay-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        Assessment Year:
      </label>
      <AYSelect currentAY={currentAY} ayOptions={ayOptions} />
    </>
  );
}

export default function Header() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <header className="py-5 px-8 flex flex-col space-y-5 z-20 relative select-none">
      {/* Top Row: Badges */}
      <div className="flex items-center justify-between">
        {/* Quick Status */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SDDS Operating Environment Active</span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Privacy Toggle Button */}
          <button
            type="button"
            onClick={togglePrivacyMode}
            className={`flex items-center justify-center space-x-2 px-4 h-8 rounded-full border text-[11px] font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isPrivacyMode
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
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
          <div className="flex items-center justify-center space-x-1.5 px-4 h-8 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 h-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-72 shadow-sm transition-all focus:bg-white"
            />
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
            <User className="h-5 w-5 text-slate-500" />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 flex justify-end items-center space-x-3">
          <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
            <HeaderControls />
          </Suspense>
          
          <Link
            href="/clients/new"
            className="flex items-center justify-center space-x-2 px-6 h-10 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
