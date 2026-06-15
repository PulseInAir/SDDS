'use client';

import { Suspense } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import { Eye, EyeOff, Search, Plus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCurrentAssessmentYear, getAssessmentYears } from '@/utils/ay';
import AYSelect from '@/ui/components/AYSelect';

// Add simple Avatar placeholder since user data might not be passed to Header in permitted scope
function UserAvatar() {
  return (
    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
      {/* Target image has a photo, but we can't add fake data, so we leave it as an empty avatar/gradient or an initials box to match the circle in the image */}
      <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-sm">
        U
      </div>
    </div>
  );
}

function HeaderControls() {
  const searchParams = useSearchParams();
  const currentAY = searchParams.get('ay') || getCurrentAssessmentYear();
  const ayOptions = getAssessmentYears();

  return (
    <>
      <label htmlFor="ay-select" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
        Assessment Year:
      </label>
      <AYSelect currentAY={currentAY} ayOptions={ayOptions} />
    </>
  );
}

export default function Header() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <div className="flex flex-col w-full z-20 relative select-none bg-[#f4f7fc] pt-4 px-4 md:px-6 lg:px-8">
      {/* Top Row: Status Pills */}
      <div className="flex items-center justify-end gap-3 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-bold text-slate-700">SDDS Operating Environment Active</span>
        </div>

        <button
          type="button"
          onClick={togglePrivacyMode}
          className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all shadow-sm ${
            isPrivacyMode
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          {isPrivacyMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>Privacy Mode: {isPrivacyMode ? 'ON' : 'OFF'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[11px] font-bold text-slate-700">SSL Secure Connection</span>
        </div>
      </div>

      {/* Main Header Row */}
      <header className="flex items-center justify-between gap-6 pb-6 w-full">
        {/* Left: Title & Subtitle */}
        <div className="flex flex-col flex-shrink-0">
          <h1 className="text-[28px] leading-none font-extrabold text-[#1e3a8a] tracking-tight mb-1.5">Dashboard</h1>
          <p className="text-[13px] font-medium text-slate-500">Overview of clients, filings, and collections.</p>
        </div>

        {/* Middle: Expanded Search Bar & Avatar */}
        <div className="flex flex-1 items-center justify-center max-w-xl gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-white border border-white rounded-full pl-11 pr-5 h-11 text-[14px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-full shadow-sm transition-all focus:bg-white hover:border-slate-300"
            />
          </div>
          <UserAvatar />
        </div>

        {/* Right: Controls Row */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* AY Select */}
          <div className="flex items-center space-x-2.5">
            <Suspense fallback={<div className="text-slate-400 text-xs">Loading...</div>}>
              <HeaderControls />
            </Suspense>
          </div>

          {/* Add Client */}
          <Link
            href="/clients/new"
            className="flex items-center justify-center space-x-2 px-6 h-11 rounded-full text-[14px] font-semibold text-white bg-[#0e5ef5] hover:bg-blue-600 transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
