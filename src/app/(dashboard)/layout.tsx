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
      <div className="min-h-dvh w-full bg-[linear-gradient(135deg,#d8b4fe_0%,#818cf8_100%)] p-1 md:p-2 lg:p-2.5 flex items-stretch">
        <div className="flex-1 flex bg-[#eef2ff] rounded-[24px] lg:rounded-[40px] p-1 lg:p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] min-w-0 max-w-full">
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f4f7fc] rounded-[20px] lg:rounded-[36px] shadow-sm relative min-w-0 max-w-full">

            {/* Sidebar Wrapper */}
            <div className="order-last md:order-first relative md:h-full flex-shrink-0 bg-[#0e5ef5] w-full md:w-[76px] lg:w-[280px] xl:w-[290px] overflow-x-auto overflow-y-hidden md:overflow-visible [&_a:not(.text-blue-700)]:text-white [&_a:not(.text-blue-700)]:bg-transparent hover:[&_a:not(.text-blue-700)]:bg-white/10 [&_span]:hidden lg:[&_span]:inline-block transition-all duration-300 z-20 [&_nav]:!flex-row md:[&_nav]:!flex-col [&_nav]:!items-center md:[&_nav]:!items-stretch [&_nav]:!py-3 md:[&_nav]:!py-6 [&_nav>div:nth-child(3)]:!flex-row md:[&_nav>div:nth-child(3)]:!flex-col [&_nav>div:nth-child(3)]:!items-center md:[&_nav>div:nth-child(3)]:!items-stretch [&_nav>div:nth-child(3)]:!gap-6 md:[&_nav>div:nth-child(3)]:!gap-2 [&_nav_a]:!rounded-xl md:[&_nav_a]:!rounded-l-2xl md:[&_nav_a]:!rounded-r-none [&_nav_a]:!p-3 md:[&_nav_a]:!py-3 md:[&_nav_a]:!px-4 [&_nav_a.text-blue-700]:!bg-[#f4f7fc] md:[&_nav_a.text-blue-700]:!bg-[#f4f7fc] [&_nav_a.text-blue-700]:relative [&_nav_a.text-blue-700]:before:content-[''] [&_nav_a.text-blue-700]:before:absolute [&_nav_a.text-blue-700]:before:right-0 [&_nav_a.text-blue-700]:before:-top-6 [&_nav_a.text-blue-700]:before:w-6 [&_nav_a.text-blue-700]:before:h-6 [&_nav_a.text-blue-700]:before:bg-transparent [&_nav_a.text-blue-700]:before:rounded-br-2xl [&_nav_a.text-blue-700]:before:shadow-[10px_10px_0_10px_#f4f7fc] [&_nav_a.text-blue-700]:after:content-[''] [&_nav_a.text-blue-700]:after:absolute [&_nav_a.text-blue-700]:after:right-0 [&_nav_a.text-blue-700]:after:-bottom-6 [&_nav_a.text-blue-700]:after:w-6 [&_nav_a.text-blue-700]:after:h-6 [&_nav_a.text-blue-700]:after:bg-transparent [&_nav_a.text-blue-700]:after:rounded-tr-2xl [&_nav_a.text-blue-700]:after:shadow-[10px_-10px_0_10px_#f4f7fc] [&_nav>div:last-child]:hidden md:[&_nav>div:last-child]:!flex [&_nav>div:nth-child(2)]:hidden md:[&_nav>div:nth-child(2)]:!flex [&_nav>div:first-child]:hidden md:[&_nav>div:first-child]:!block pb-[env(safe-area-inset-bottom)] md:pb-0">
              <Sidebar />

              {/* Overlay SD badge and brand block */}
              <div className="hidden lg:block absolute top-0 left-0 w-full bg-[#0e5ef5] pt-8 z-10 pointer-events-none">
                <div className="flex items-center gap-3.5 mb-10 px-6">
                  <div className="bg-white/20 rounded-xl w-12 h-12 flex items-center justify-center font-bold text-white pointer-events-auto shadow-sm">
                    SD
                  </div>
                  <span className="font-bold text-xl tracking-wide text-white pointer-events-auto">SDDS Portal</span>
                </div>
              </div>

              {/* Overlay real user data and sign-out */}
              <div className="hidden lg:block absolute bottom-0 left-0 w-full bg-[#0e5ef5] pb-8 px-6 z-10">
                <div className="bg-blue-900/40 rounded-2xl p-5 flex flex-col gap-4 border border-blue-800/50 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-white/20 rounded-full p-2.5 shrink-0">
                      <ShieldCheck className="w-[22px] h-[22px] text-white" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-white truncate text-[15px]">
                        {user?.user_metadata?.full_name || 'Admin User'}
                      </span>
                      <span className="text-[13px] text-white/80 font-medium truncate">
                        {user?.email || 'singledigitalsolutions@gmail.com'}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-2.5 bg-blue-950/40 text-white hover:bg-pink-500/15 hover:text-pink-400 rounded-xl w-full py-3 transition-colors mt-1 group">
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-semibold text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fc] min-w-0 max-w-full">
              {/* Header */}
              <Header />

              {/* Main Scrollable Area */}
              <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 pt-0">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </PrivacyProvider>
  );
}