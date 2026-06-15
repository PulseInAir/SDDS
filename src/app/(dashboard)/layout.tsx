import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { Sidebar } from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header";
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
      <div className="min-h-dvh w-full bg-[linear-gradient(135deg,#d8b4fe_0%,#818cf8_100%)] p-2 md:p-4 lg:p-8 flex items-stretch">
        <div className="flex-1 flex bg-[#eef2ff] rounded-[24px] lg:rounded-[40px] p-1.5 md:p-3 lg:p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] min-w-0 max-w-full">
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white rounded-[20px] lg:rounded-[32px] shadow-sm relative min-w-0 max-w-full">

            {/* Sidebar Wrapper */}
            <div className="order-last md:order-first relative md:h-full flex-shrink-0 bg-[#1e3a8a] w-full md:w-[76px] lg:w-[280px] xl:w-[300px] overflow-x-auto overflow-y-hidden md:overflow-visible [&_a:not(.text-blue-700)]:text-white [&_a:not(.text-blue-700)]:bg-transparent hover:[&_a:not(.text-blue-700)]:bg-white/10 [&_span]:hidden lg:[&_span]:inline-block transition-all duration-300 z-20 [&_nav]:!flex-row md:[&_nav]:!flex-col [&_nav]:!items-center md:[&_nav]:!items-stretch [&_nav]:!py-3 md:[&_nav]:!py-6 [&_nav>div:nth-child(3)]:!flex-row md:[&_nav>div:nth-child(3)]:!flex-col [&_nav>div:nth-child(3)]:!items-center md:[&_nav>div:nth-child(3)]:!items-stretch [&_nav>div:nth-child(3)]:!gap-6 md:[&_nav>div:nth-child(3)]:!gap-2 [&_nav_a]:!rounded-xl md:[&_nav_a]:!rounded-l-2xl md:[&_nav_a]:!rounded-r-none [&_nav_a]:!p-3 md:[&_nav_a]:!py-3 md:[&_nav_a]:!px-4 [&_nav_a.text-blue-700]:!bg-white/20 md:[&_nav_a.text-blue-700]:!bg-transparent [&_nav>div:last-child]:hidden md:[&_nav>div:last-child]:!flex [&_nav>div:nth-child(2)]:hidden md:[&_nav>div:nth-child(2)]:!flex [&_nav>div:first-child]:hidden md:[&_nav>div:first-child]:!block pb-[env(safe-area-inset-bottom)] md:pb-0">
              <Sidebar />

              {/* Overlay SD badge and brand block */}
              <div className="hidden lg:block absolute top-0 left-0 w-full bg-[#1e3a8a] pt-8 z-10 pointer-events-none">
                <div className="flex items-center gap-3.5 mb-10 px-6">
                  <div className="bg-blue-800 rounded-xl w-12 h-12 flex items-center justify-center font-bold text-white pointer-events-auto shadow-sm">
                    SD
                  </div>
                  <span className="font-bold text-xl tracking-wide text-white pointer-events-auto">SDDS Portal</span>
                </div>
              </div>

              {/* Overlay real user data and sign-out */}
              <div className="hidden lg:block absolute bottom-0 left-0 w-full bg-[#1e3a8a] pb-8 px-6 z-10">
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
            <div className="flex-1 flex flex-col overflow-hidden bg-white min-w-0 max-w-full">
              {/* Header */}
              <Header />

              {/* Main Scrollable Area */}
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </PrivacyProvider>
  );
}