import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, Users, Clock, FileText, Settings, LogOut, Shield, Database, IndianRupee } from 'lucide-react';
import { logout } from '@/app/login/actions';
import { PrivacyProvider } from '@/context/PrivacyContext';
import Header from '@/components/Header';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all font-medium text-sm group"
    >
      <span className="text-white/80 group-hover:text-white transition-colors">{icon}</span>
      <span>{label}</span>
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

  return (
    <PrivacyProvider>
      <div className="sdds-app-bg font-sans">
        <div className="sdds-app-frame">
          {/* Sidebar */}
          <aside className="w-[280px] bg-gradient-to-b from-blue-600 to-blue-900 rounded-l-[32px] p-6 flex flex-col justify-between shrink-0 select-none h-full">
            <div>
              {/* Logo */}
              <div className="flex items-center mb-10 px-4 mt-2">
                <Link href="/" className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-blue-800 font-extrabold text-lg tracking-tight">SD</span>
                  </div>
                  <span className="font-bold text-xl text-white tracking-tight">SDDS Portal</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                <NavItem href="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                <NavItem href="/clients" icon={<Users className="h-4 w-4" />} label="Clients" />
                <NavItem href="/queue" icon={<Clock className="h-4 w-4" />} label="Filing Queue" />
                <NavItem href="/invoices" icon={<FileText className="h-4 w-4" />} label="Invoices" />
                <NavItem href="/revenue" icon={<IndianRupee className="h-4 w-4" />} label="Revenue / Collections" />
                <NavItem href="/data" icon={<Database className="h-4 w-4" />} label="Data Manager" />
                <NavItem href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
              </nav>
            </div>

            {/* Footer info & Logout */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 px-2">
                <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">Admin User</p>
                  <p className="text-[10px] text-white/70 truncate">{user.email}</p>
                </div>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-white hover:bg-white/10 transition-all font-medium text-sm cursor-pointer border-none bg-transparent text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-slate-950 overflow-y-auto relative flex flex-col">
            {/* Header */}
            <Header />
            {/* Background glow decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="flex-1 p-8 relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PrivacyProvider>
  );
}
