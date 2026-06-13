"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  IndianRupee,
  Database,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Filing Queue', href: '/queue', icon: Clock },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Revenue / Collections', href: '/revenue', icon: IndianRupee },
  { name: 'Data Manager', href: '/data', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const [style, setStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const updateIndicator = useCallback(() => {
    const index = navItems.findIndex(item => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
    if (index > -1 && navRef.current && linkRefs.current[index]) {
      const containerRect = navRef.current.getBoundingClientRect();
      const activeRect = linkRefs.current[index]?.getBoundingClientRect();
      if (containerRect && activeRect) {
        setStyle({
          top: activeRect.top - containerRect.top,
          height: activeRect.height,
          opacity: 1
        });
      }
    } else {
      setStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  useEffect(() => {
    updateIndicator();
  }, [pathname, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <nav ref={navRef} className="sdds-sidebar relative flex flex-col h-full py-6">
      {/* Cut-out indicator */}
      <div
        className="absolute right-0 bg-white transition-all duration-300 ease-out"
        style={{
          left: '0.75rem',
          top: style.top,
          height: style.height,
          opacity: style.opacity,
          borderTopLeftRadius: '1.5rem',
          borderBottomLeftRadius: '1.5rem',
          zIndex: 0
        }}
      >
        <div 
          className="absolute right-0 w-[1.5rem] h-[1.5rem] pointer-events-none" 
          style={{ 
            top: '-1.5rem',
            background: 'radial-gradient(circle at top left, transparent 1.5rem, #ffffff 1.5rem)' 
          }} 
        />
        <div 
          className="absolute right-0 w-[1.5rem] h-[1.5rem] pointer-events-none" 
          style={{ 
            bottom: '-1.5rem',
            background: 'radial-gradient(circle at bottom left, transparent 1.5rem, #ffffff 1.5rem)' 
          }} 
        />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-4 relative" style={{ zIndex: 1 }}>
        <div className="bg-blue-800 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-white">
          SD
        </div>
        <span className="font-bold text-lg text-white">SDDS Portal</span>
      </div>

      {/* Menu */}
      <div className="flex-1 flex flex-col gap-2 pl-3 pr-0 relative" style={{ zIndex: 1 }}>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              ref={(el) => { linkRefs.current[index] = el; }}
              className={`flex items-center gap-3 px-4 py-3 rounded-l-2xl transition-colors duration-200 ${isActive ? 'text-blue-700 font-semibold' : 'text-blue-100 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-blue-800/50 px-4 relative" style={{ zIndex: 1 }}>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-200" />
          <div className="flex flex-col">
            <span className="font-semibold text-white">Admin User</span>
            <span className="text-xs text-blue-200">singledigitalsolutions@gmail.com</span>
          </div>
        </div>
        <button className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-2 py-2 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}