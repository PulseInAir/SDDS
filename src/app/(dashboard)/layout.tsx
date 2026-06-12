import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, Users, Clock, FileText, Settings, LogOut, Shield, Database, IndianRupee } from 'lucide-react';
import { logout } from '@/app/login/actions';
import { PrivacyProvider } from '@/context/PrivacyContext';
import Header from '@/components/Header';

import { headers } from 'next/headers';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarNavItem({ href, icon, label, active }: NavItemProps) {
  if (active) {
    return (
      <Link
        href={href}
        className="flex items-center space-x-3 px-[24px] h-[60px] bg-white rounded-[24px] font-bold text-sm text-blue-900 shadow-[0_4px_20px_rgba(255,255,255,0.15)] ml-6 mr-3 transition-all"
      >
        <span className="text-blue-900">{icon}</span>
        <span className="text-blue-900">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-[24px] h-[60px] rounded-[24px] bg-transparent text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium text-sm ml-6 mr-3"
    >
      <span className="text-white/80 shrink-0 flex items-center justify-center">{icon}</span>
      <span className="text-white/80">{label}</span>
    </Link>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || headersList.get('x-pathname') || '/';

  return (
    <PrivacyProvider>
      <div className="sdds-app-bg font-sans !items-start xl:!items-center !p-4 xl:!p-8">
        <div className="sdds-app-frame flex-col xl:flex-row !h-auto xl:!h-[941px] w-full">
          <div className="sdds-inner-frame flex-col xl:flex-row relative">
            {/* Sidebar */}
            <aside className="w-full xl:w-[280px] bg-[#1d4ed8] max-xl:rounded-t-[32px] pt-8 pb-8 flex flex-col justify-between shrink-0 select-none h-auto xl:h-full gap-8 xl:gap-0 z-20 relative">
              <div>
                {/* Logo */}
                <div className="flex items-center mb-10 px-10 mt-2">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-blue-800 font-extrabold text-lg tracking-tight">SD</span>
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">SDDS Portal</span>
                  </Link>
                </div>

              {/* Navigation Links */}
              <nav className="space-y-3">
                <SidebarNavItem href="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active={pathname === '/' || pathname.startsWith('/dashboard')} />
                <SidebarNavItem href="/clients" icon={<Users className="h-4 w-4" />} label="Clients" active={pathname.startsWith('/clients')} />
                <SidebarNavItem href="/queue" icon={<Clock className="h-4 w-4" />} label="Filing Queue" active={pathname.startsWith('/queue') || pathname.startsWith('/filing-queue')} />
                <SidebarNavItem href="/invoices" icon={<FileText className="h-4 w-4" />} label="Invoices" active={pathname.startsWith('/invoices')} />
                <SidebarNavItem href="/revenue" icon={<IndianRupee className="h-4 w-4" />} label="Revenue / Collections" active={pathname.startsWith('/revenue') || pathname.startsWith('/collections')} />
                <SidebarNavItem href="/data" icon={<Database className="h-4 w-4" />} label="Data Manager" active={pathname.startsWith('/data') || pathname.startsWith('/data-manager')} />
                <SidebarNavItem href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={pathname.startsWith('/settings')} />
              </nav>
            </div>

            {/* Footer info & Logout */}
            <div className="mt-8 mx-6 bg-blue-900/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-100">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">Admin User</p>
                  <p className="text-xs text-blue-200/70 truncate">{user.email}</p>
                </div>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-all font-bold text-sm cursor-pointer border-none"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative flex flex-col min-w-0 max-xl:h-auto">
            {/* Header */}
            <Header />
            <div className="flex-1 p-4 xl:p-8 relative z-10 min-w-0">
              {children}
            </div>
          </main>
          </div>
        </div>
      </div>
    </PrivacyProvider>
  );
}
