'use client';

import { Suspense } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { Eye, EyeOff, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import AYSelect from '@/ui/components/AYSelect';

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
    <header className="py-6 px-8 flex items-center justify-between z-20 relative select-none">
      {/* Left: Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-[28px] leading-none font-extrabold text-[#1e3a8a] tracking-tight mb-1.5">Dashboard</h1>
        <p className="text-[13px] font-medium text-slate-500">Overview of clients, filings, and collections.</p>
      </div>

      {/* Right: Controls Row */}
      <div className="flex items-center space-x-5">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 h-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full shadow-sm transition-all focus:bg-white"
          />
        </div>

        {/* Privacy Toggle */}
        <button
          type="button"
          onClick={togglePrivacyMode}
          className={`flex items-center justify-center space-x-2 px-4 h-10 rounded-full border text-[13px] font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isPrivacyMode
              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {isPrivacyMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Privacy Mode: ON</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Privacy Mode: OFF</span>
            </>
          )}
        </button>

        {/* AY Select */}
        <div className="flex items-center space-x-3">
          <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
            <HeaderControls />
          </Suspense>
        </div>

        {/* Add Client */}
        <Link
          href="/clients/new"
          className="flex items-center justify-center space-x-2 px-6 h-10 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </Link>
      </div>
    </header>
  );
}
