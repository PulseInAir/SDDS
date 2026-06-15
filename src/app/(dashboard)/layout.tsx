import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { Sidebar } from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header"; // Import the Header
import { ShieldCheck, LogOut } from 'lucide-react';

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
      <div className="sdds-app-bg">
        <div className="sdds-app-frame">
          <div className="sdds-inner-frame">
            {/* Sidebar Wrapper */}
            <div className="sdds-sidebar relative h-full flex-shrink-0 bg-[var(--sdds-sidebar-blue)] w-[300px] [&_a:not(.text-blue-700)]:text-white [&_a:not(.text-blue-700)]:bg-transparent hover:[&_a:not(.text-blue-700)]:bg-white/10">
              <Sidebar />

              {/* Overlay SD badge and brand block */}
              <div className="absolute top-0 left-0 w-full bg-[var(--sdds-sidebar-blue)] pt-8 z-10 pointer-events-none">
                <div className="flex items-center gap-3.5 mb-10 px-6">
                  <div className="bg-blue-800 rounded-xl w-12 h-12 flex items-center justify-center font-bold text-white pointer-events-auto shadow-sm">
                    SD
                  </div>
                  <span className="font-bold text-xl tracking-wide text-white pointer-events-auto">SDDS Portal</span>
                </div>
              </div>

              {/* Overlay real user data and sign-out */}
              <div className="absolute bottom-0 left-0 w-full bg-[var(--sdds-sidebar-blue)] pb-8 px-6 z-10">
                <div className="bg-blue-900/40 rounded-2xl p-5 flex flex-col gap-4 border border-blue-800/50 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-blue-800 rounded-full p-2.5 shrink-0">
                      <ShieldCheck className="w-[22px] h-[22px] text-blue-200" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-white truncate text-[15px]">
                        {user?.user_metadata?.full_name || 'Admin User'}
                      </span>
                      <span className="text-[13px] text-blue-200/80 font-medium truncate">
                        {user?.email || 'singledigitalsolutions@gmail.com'}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-2.5 bg-blue-950/40 text-blue-200 hover:bg-pink-500/15 hover:text-pink-400 rounded-xl w-full py-3 transition-colors mt-1 group">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-semibold text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[var(--sdds-content-canvas-bg)]">
              {/* Header */}
              <Header />

              {/* Main Scrollable Area */}
              <main
                className="flex-1 overflow-y-auto"
                style={{ padding: 'var(--sdds-spacing-padding-large)' }}
              >
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </PrivacyProvider>
  );
}