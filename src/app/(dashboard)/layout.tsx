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
            <div className="relative h-full flex-shrink-0 bg-[var(--sdds-sidebar-blue)] [&_a:not(.text-blue-700)]:text-white [&_a:not(.text-blue-700)]:bg-transparent hover:[&_a:not(.text-blue-700)]:bg-white/10">
              <Sidebar />

              {/* Overlay SD badge and brand block */}
              <div className="absolute top-0 left-0 w-full bg-[var(--sdds-sidebar-blue)] pt-6 z-10 pointer-events-none">
                <div className="flex items-center gap-3 mb-8 px-4">
                  <div className="bg-blue-800 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-white pointer-events-auto">
                    SD
                  </div>
                  <span className="font-bold text-lg text-white pointer-events-auto">SDDS Portal</span>
                </div>
              </div>

              {/* Overlay real user data and sign-out */}
              <div className="absolute bottom-0 left-0 w-full bg-[var(--sdds-sidebar-blue)] pb-6 z-10">
                <div className="pt-6 border-t border-blue-800/50 px-4">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-8 h-8 text-blue-200" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">
                        {user?.user_metadata?.full_name || 'Admin User'}
                      </span>
                      <span className="text-xs text-blue-200">
                        {user?.email || 'singledigitalsolutions@gmail.com'}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-2 py-2 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
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