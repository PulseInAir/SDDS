import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { PrivacyProvider } from '@/context/PrivacyContext';
import { Sidebar } from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header"; // Import the Header

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
      <div
        className="sdds-app-bg"
        style={{ padding: 'var(--sdds-spacing-padding-large)' }}
      >
        <div
          className="sdds-app-frame"
          style={{
            height: 'calc(100vh - calc(var(--sdds-spacing-padding-large) * 2))',
            maxWidth: '1672px',
            padding: '12px',
            margin: '0 auto'
          }}
        >
          <div className="sdds-inner-frame">
            {/* Sidebar */}
            <Sidebar />

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